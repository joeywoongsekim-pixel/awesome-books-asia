import {Fragment} from 'react';

// Renders a translated string containing literal "<br>" markers as real line
// breaks. Headings keep the prototype's controlled breaks without putting
// rich-text tags through the ICU parser.
export default function Multiline({text}: {text: string}) {
  const parts = text.split('<br>');
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {part}
        </Fragment>
      ))}
    </>
  );
}
