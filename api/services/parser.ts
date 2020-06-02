import path from "path";
import { promises as fs, existsSync } from "fs";
import crypto from "crypto";
import consola from "consola";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token";
// @ts-ignore
import mk from "markdown-it-katex";
// @ts-ignore
import attrs from "markdown-it-attrs";

const dollarTrimRegex = /^\$+|\$+$/g;
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

interface ParsedCard {
  id: string;
  section: RenderedText;
  title: RenderedText;
  body: RenderedText;
  align?: string;
}

interface ParsedCardSet {
  id: string;
  name: string;
  section: string;
  wip: boolean;
  cards: ParsedCard[];
}

export function parse(
  fileName: string,
  data: string,
  macros?: object
): ParsedCardSet {
  consola.info("Parsing", fileName + " ...");

  const { content, data: frontMatter } = matter(data);
  const name =
    frontMatter.name || fileName.substring(0, fileName.lastIndexOf("."));
  const id = frontMatter.id || idify(name.replace(nonAlphanumericRegexp, ""));
  const section = frontMatter.section || "";
  const wip = frontMatter.wip || false;

  const md = MarkdownIt({ html: true });
  md.use(attrs, {
    leftDelimiter: "{{",
    rightDelimiter: "}}"
  });
  md.use(mk, { throwOnError: false, macros });

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
  const cards: ParsedCard[] = [];

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

  return { id, name, section, wip, cards };
}

export async function parseAll(
  parsePath: string,
  macros?: object
): Promise<ParsedCardSet[]> {
  if (!macros) {
    const macrosPath = path.join(parsePath, "_Macros.md");
    if (existsSync(macrosPath)) {
      const macrosData = await fs.readFile(macrosPath, "utf8");
      macros = Object.fromEntries(
        macrosData
          .trim()
          .split("\n\n")
          .map((macro) =>
            macro
              .split("\n")
              .map((line) => line.trim().replace(dollarTrimRegex, ""))
          )
      );
    } else {
      macros = {};
    }
  }
  const cardSets: ParsedCardSet[] = [];
  const fileName = path.basename(parsePath);
  if (fileName.endsWith(".md") && !fileName.startsWith("_")) {
    const cardSet = parse(
      fileName,
      await fs.readFile(parsePath, "utf8"),
      macros
    );
    cardSets.push(cardSet);
  } else if ((await fs.stat(parsePath)).isDirectory()) {
    const fileNames = await fs.readdir(parsePath);
    for (const fileName of fileNames) {
      const filePath = path.join(parsePath, fileName);
      cardSets.push.apply(cardSets, await parseAll(filePath, macros));
    }
  }
  return cardSets;
}
