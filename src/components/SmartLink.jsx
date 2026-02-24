import { Link } from "react-router-dom";

function isInternalHref(href) {
  return typeof href === "string" && (href.startsWith("/") || href.startsWith("./"));
}

/**
 * Use React Router navigation for internal links to avoid full reloads.
 * Falls back to a normal <a> for hashes and external URLs.
 */
export function SmartLink({ href, children, ...rest }) {
  if (isInternalHref(href)) {
    return (
      <Link to={href} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

