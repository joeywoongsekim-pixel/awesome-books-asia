// Renders a schema.org object as an application/ld+json script tag.
// Server component — the JSON is baked into the HTML for crawlers.
export default function JsonLd({data}: {data: object}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html: JSON.stringify(data)}}
    />
  );
}
