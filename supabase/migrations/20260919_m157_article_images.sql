-- M157 — pictures in magazine articles
--
-- An article is written elsewhere and pasted into the console as HTML, and
-- the pictures come with it as data: URIs — the whole photograph encoded
-- into the markup. Two things are wrong with storing that:
--
--   the row stops being text and becomes megabytes, and every translation
--   then carries those megabytes to the model and back; and
--
--   the sanitiser blocks data: URIs, because an <img src="data:text/html,…">
--   is a page rather than a picture. So the photographs would simply
--   vanish on save, which is the failure this migration exists to prevent.
--
-- Instead the console lifts every picture out on the way to saving, puts it
-- in this bucket, and leaves a URL in the markup. The writer pastes and
-- saves; nothing is uploaded by hand; the row stays small; and the picture
-- cannot go missing later, because it is ours rather than someone else's.
--
-- The bucket already existed and was public, but carried no write policy at
-- all — so nothing could be put in it.
--
-- Applied via MCP on 2026-09-19.

update storage.buckets
set public = true,
    -- a generous photograph, not a video
    file_size_limit = 15728640,
    -- no SVG: it is a document that can carry script, and every picture
    -- here is a photograph
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'
    ]
where id = 'article-images';

drop policy if exists "admins add article images" on storage.objects;
create policy "admins add article images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'article-images' and public.is_admin());

drop policy if exists "admins replace article images" on storage.objects;
create policy "admins replace article images" on storage.objects
  for update to authenticated
  using (bucket_id = 'article-images' and public.is_admin())
  with check (bucket_id = 'article-images' and public.is_admin());

drop policy if exists "admins remove article images" on storage.objects;
create policy "admins remove article images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'article-images' and public.is_admin());

-- The bucket is public, so readers are served by the public endpoint and
-- never reach this table; an admin listing the bucket in the console does.
drop policy if exists "admins list article images" on storage.objects;
create policy "admins list article images" on storage.objects
  for select to authenticated
  using (bucket_id = 'article-images' and public.is_admin());
