-- Public read path for the /u/[slug] portfolio page. SECURITY DEFINER so
-- visibility is enforced inside the function itself — defense-in-depth
-- beyond RLS, so a misconfigured policy can't leak a private profile.
-- Callable by anon (unauthenticated visitors) and authenticated alike.

create function public.get_portfolio_by_slug(p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_profile profiles%rowtype;
  result jsonb;
begin
  select * into v_profile
  from profiles
  where slug = p_slug and portfolio_visibility in ('public', 'unlisted');

  if not found then
    return null;
  end if;

  select jsonb_build_object(
    'profile', jsonb_build_object(
      'slug', v_profile.slug,
      'full_name', v_profile.full_name,
      'headline', v_profile.headline,
      'bio', v_profile.bio,
      'location', v_profile.location,
      'contact_email', v_profile.contact_email,
      'avatar_url', v_profile.avatar_url,
      'portfolio_theme', v_profile.portfolio_theme,
      'theme_config', v_profile.theme_config,
      'portfolio_visibility', v_profile.portfolio_visibility
    ),
    'jobs', coalesce((
      select jsonb_agg(jsonb_build_object(
        'company', w.company,
        'title', w.title,
        'location', w.location,
        'start_date', w.start_date,
        'end_date', w.end_date,
        'is_current', w.is_current,
        'description', w.description,
        'highlights', w.highlights
      ) order by w.display_order asc)
      from work_history w
      where w.user_id = v_profile.id
    ), '[]'::jsonb),
    'projects', coalesce((
      select jsonb_agg(jsonb_build_object(
        'slug', p.slug,
        'name', p.name,
        'summary', p.summary,
        'description', p.description,
        'tech_stack', p.tech_stack,
        'highlights', p.highlights,
        'links', p.links,
        'is_current', p.is_current
      ) order by p.display_order asc)
      from projects p
      where p.user_id = v_profile.id
    ), '[]'::jsonb),
    'skills', coalesce((
      select jsonb_agg(jsonb_build_object('name', s.name, 'category', s.category))
      from skills s
      where s.user_id = v_profile.id
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

-- Readable by anyone (anon included) — visibility is enforced above, inside
-- the function, not by role-level grants.
grant execute on function public.get_portfolio_by_slug(text) to anon, authenticated;
