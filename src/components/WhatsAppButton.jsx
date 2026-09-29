export default function WhatsAppButton({ href, children, className = "btn btn-primary", ...rest }) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      </svg>
      {children}
    </a>
  );
}
