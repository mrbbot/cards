import path from "path";
import { promises as fs } from "fs";
import crypto from "crypto";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token";
// @ts-ignore
import mk from "markdown-it-katex";

const metaRegex = /%(.+)%/;
const spaceRegexp = / /g;
const nonAlphanumericSpaceRegexp = /[_^/]/g;
const nonAlphanumericRegexp = /[^0-9a-zA-Z ]/g;

// makes a string into an ID
function idify(s: string): string {
  return s.replace(spaceRegexp, "-").toLowerCase();
}

enum State {
  BODY,
  SECTION_TITLE,
  CARD_TITLE
}

interface RenderedText {
  text: string;
  html: string;
}

interface Card {
  id: string;
  section: RenderedText;
  title: RenderedText;
  body: RenderedText;
  align?: string;
}

interface CardSet {
  id: string;
  name: string;
  cards: Card[];
}

export function parse(fileName: string, data: string): CardSet {
  const { content, data: frontMatter } = matter(data);
  const name =
    frontMatter.name || fileName.substring(0, fileName.lastIndexOf("."));
  const id = frontMatter.id || idify(name.replace(nonAlphanumericRegexp, ""));

  const md = MarkdownIt({ html: true });
  md.use(mk, { throwOnError: false });

  function renderTokens(tokens?: Token[]): RenderedText {
    if (!tokens) return { text: "", html: "" };

    let text = "";
    for (const token of tokens) {
      if (token.type !== "math_block") {
        text +=
          token.content
            .replace(nonAlphanumericSpaceRegexp, " ")
            .replace(nonAlphanumericRegexp, "")
            .toLowerCase() + " ";
      }
    }

    return {
      text: text.trim(),
      html: md.renderer.render(tokens, md.options, {}).trim()
    };
  }

  const tokens = md.parse(content, {});
  const cards: Card[] = [];

  let sectionTitleTokens: Token[] | undefined;
  let cardTitleTokens: Token[] | undefined;
  let cardBodyTokens: Token[] | undefined;
  let sectionTitle: RenderedText;
  // let sectionTitleColour: string | undefined;
  let cardTitle: RenderedText;

  function appendCard() {
    const cardBody = renderTokens(cardBodyTokens);
    cardBodyTokens = undefined;

    const alignMatch = metaRegex.exec(cardBody.html);
    let cardBodyAlign: string | undefined;
    if (alignMatch) {
      cardBody.html = cardBody.html.replace(alignMatch[0], "");
      cardBody.html = cardBody.html.replace("<p></p>", "");
      cardBodyAlign = alignMatch[1];
    }

    const titleHash = crypto.createHash("sha1");
    const titleHashData = titleHash.update(cardTitle.html, "utf8");
    const titleHashShort = titleHashData.digest("hex").substring(0, 4);

    const cardId = `${titleHashShort}-${idify(
      sectionTitle.text + "-" + cardTitle.text
    )}`;
    cards.push({
      id: cardId,
      section: sectionTitle,
      // sectionTitleColour,
      title: cardTitle,
      body: cardBody,
      align: cardBodyAlign
    });
  }

  let state: State = State.BODY;

  for (const token of tokens) {
    switch (state) {
      case State.BODY:
        if (token.type === "heading_open") {
          if (token.tag === "h1") {
            state = State.SECTION_TITLE;
            sectionTitleTokens = [];
          }
          if (token.tag === "h2") {
            state = State.CARD_TITLE;
            cardTitleTokens = [token];
          }

          if (token.tag === "h1" || token.tag === "h2") {
            if (cardBodyTokens) {
              appendCard();
            }
            break;
          }
        }
        if (cardBodyTokens) {
          cardBodyTokens.push(token);
        }
        break;
      case State.SECTION_TITLE:
        if (token.type === "heading_close" && token.tag === "h1") {
          state = State.BODY;
          // noinspection JSUnusedAssignment
          sectionTitle = renderTokens(sectionTitleTokens);
          sectionTitleTokens = undefined;
          break;
        }
        if (sectionTitleTokens) sectionTitleTokens.push(token);
        break;
      case State.CARD_TITLE:
        if (cardTitleTokens) cardTitleTokens.push(token);
        if (token.type === "heading_close" && token.tag === "h2") {
          state = State.BODY;
          cardBodyTokens = [];
          // noinspection JSUnusedAssignment
          cardTitle = renderTokens(cardTitleTokens);
          cardTitleTokens = undefined;
        }
        break;
    }
  }

  if (cardBodyTokens) {
    appendCard();
  }

  return { id, name, cards };
}

export async function parseAll(parsePath: string): Promise<CardSet[]> {
  const cardSets: CardSet[] = [];
  if (parsePath.endsWith(".md")) {
    const fileName = path.basename(parsePath);
    const cardSet = parse(fileName, await fs.readFile(parsePath, "utf8"));
    cardSets.push(cardSet);
  } else if ((await fs.stat(parsePath)).isDirectory()) {
    const fileNames = await fs.readdir(parsePath);
    for (const fileName of fileNames) {
      const filePath = path.join(parsePath, fileName);
      cardSets.push.apply(cardSets, await parseAll(filePath));
    }
  }
  return cardSets;
}
