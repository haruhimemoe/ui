/**
 * @file src/components/basics/proseStyles.ts
 * @desc Prose's class list, one rule group per line, joined once.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

/** Prose's classes. Each line is one element's rules; the joined string is what Prose renders. */
export const PROSE_CLASSES = [
  // Prose's existing rules, unchanged, split by element.
  "max-w-3xl text-c2 leading-relaxed [&>:first-child]:mt-0",
  "[&_a:hover]:text-c1 [&_a]:text-h1 [&_a]:underline",
  "[&_blockquote]:mt-3 [&_blockquote]:border-b2 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:text-c3",
  "[&_code]:rounded [&_code]:bg-b4 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em]",
  "[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:font-bold [&_h2]:text-2xl [&_h2]:text-c1",
  "[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-bold [&_h3]:text-c1 [&_h3]:text-lg",
  "[&_hr]:my-8 [&_hr]:border-b3 [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-3",
  "[&_pre:not([role=group])]:mt-3 [&_pre:not([role=group])]:relative [&_pre:not([role=group])]:overflow-x-auto [&_pre:not([role=group])]:rounded-md [&_pre:not([role=group])]:bg-b6 [&_pre:not([role=group])]:p-3 [&_pre:not([role=group])]:text-sm [&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_strong]:text-c1",
  "[&_table]:mt-4 [&_table]:w-full [&_table]:text-sm [&_td]:border-b3 [&_td]:border-b [&_td]:px-2 [&_td]:py-1.5 [&_th]:border-b3 [&_th]:border-b [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_th]:text-c1",
  "[&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6",
  // 0.17.0 additions.
  "[&>section:first-child>:first-child]:mt-0 [&_[id]]:scroll-mt-6",
  "[&_h4]:mt-5 [&_h4]:mb-1 [&_h4]:font-bold [&_h4]:text-c1",
  "[&_dt]:mt-3 [&_dt]:font-bold [&_dt]:text-c1 [&_dd]:mt-1 [&_dd]:pl-4",
  "[&_figure]:mt-4 [&_figcaption]:mt-2 [&_figcaption]:text-c3 [&_figcaption]:text-sm",
  "[&_.contains-task-list]:list-none [&_.contains-task-list]:pl-0 [&_.task-list-item]:flex [&_.task-list-item]:items-baseline [&_.task-list-item]:gap-2 [&_.task-list-item_input]:accent-h1",
  "[&_section.footnotes]:mt-10 [&_section.footnotes]:border-t [&_section.footnotes]:border-b3 [&_section.footnotes]:pt-4 [&_section.footnotes]:text-c3 [&_section.footnotes]:text-sm [&_[data-footnote-ref]]:no-underline [&_[data-footnote-backref]]:ml-1 [&_li:target]:border-l-2 [&_li:target]:border-h1 [&_li:target]:bg-b4 [&_li:target]:pl-2",
  "[&_details]:mt-3 [&_summary]:cursor-pointer",
  // 0.24.0: long inline code and bare links wrap on a phone instead of running off the page.
  "[&_:not(pre)>code]:wrap-anywhere [&_a]:wrap-break-word",
].join(" ");
