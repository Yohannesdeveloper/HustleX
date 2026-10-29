import React from "react";

// Matches URLs (with or without protocol), emails, and phone numbers.
// Order matters: URL first so emails inside URLs are not re-split.
const LINK_REGEX =
  /(https?:\/\/[^\s<]+|www\.[^\s<]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|(?:\+?[\d][\d\-.\s()/]{7,14}\d))/g;

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^\+?[\d][\d\-.\s()/]{7,14}\d$/;
const WWW_REGEX = /^www\.[^\s<]+$/;

/** Strip trailing punctuation that got swallowed by the greedy URL match. */
const trimTrailingPunctuation = (token: string): { text: string; trailing: string } => {
  let text = token;
  let trailing = "";
  while (/[.,;:!?)\]]$/.test(text)) {
    // Keep ')' only if the token has a matching '(' (e.g. parenthesised URLs)
    if (text.endsWith(")") && (text.match(/\(/g) || []).length === 0) {
      trailing = text.slice(-1) + trailing;
      text = text.slice(0, -1);
      continue;
    }
    if (text.endsWith(")")) {
      break;
    }
    trailing = text.slice(-1) + trailing;
    text = text.slice(0, -1);
  }
  return { text, trailing };
};

interface LinkifyProps {
  text: string;
  /** Classes applied to generated links (e.g. colors for dark/light mode). */
  linkClassName?: string;
}

/**
 * Renders plain text with URLs, emails and phone numbers turned into
 * clickable links:
 *  • URLs        -> <a href target="_blank">
 *  • Emails      -> <a href="mailto:...">
 *  • Phone numbers -> <a href="tel:...">
 */
const Linkify: React.FC<LinkifyProps> = ({ text, linkClassName }) => {
  if (!text) return null;

  const parts = text.split(LINK_REGEX);

  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        if (!LINK_REGEX.test(part)) {
          // Reset lastIndex of the global regex before cheap re-checks
          LINK_REGEX.lastIndex = 0;
          return <React.Fragment key={i}>{part}</React.Fragment>;
        }
        LINK_REGEX.lastIndex = 0;

        const { text: token, trailing } = trimTrailingPunctuation(part);

        const classes = linkClassName || "text-cyan-500 underline break-all";

        if (EMAIL_REGEX.test(token)) {
          return (
            <>
              <a
                href={`mailto:${token}`}
                className={classes}
                title={`Email ${token}`}
              >
                {token}
              </a>
              {trailing}
            </>
          );
        }

        if (/^(https?:\/\/|www\.)/i.test(token) || WWW_REGEX.test(token)) {
          const href = /^https?:\/\//i.test(token)
            ? token
            : `https://${token}`;
          return (
            <>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className={classes}
                title={href}
              >
                {token}
              </a>
              {trailing}
            </>
          );
        }

        if (PHONE_REGEX.test(token)) {
          const telHref = `tel:${token.replace(/[^\d+]/g, "")}`;
          return (
            <>
              <a href={telHref} className={classes} title={`Call ${token}`}>
                {token}
              </a>
              {trailing}
            </>
          );
        }

        return (
          <React.Fragment key={i}>
            {part}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default Linkify;
