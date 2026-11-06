type FooterLink = {
  label: string;
  href: string;
};

const productos: FooterLink[] = [
  { label: "Global Payroll", href: "#" },
  { label: "Employer of Record", href: "#" },
  { label: "PEO (US)", href: "#" },
  { label: "Contractor Management", href: "#" },
];

const recursos: FooterLink[] = [
  { label: "Blog", href: "#" },
  { label: "Help center", href: "#" },
  { label: "Security", href: "#" },
  { label: "Changelog", href: "#" },
];

const developers: FooterLink[] = [
  { label: "API Reference", href: "#" },
  { label: "MCP Server", href: "#" },
  { label: "CLI", href: "#" },
  { label: "Status", href: "#" },
];

const compania: FooterLink[] = [
  { label: "About", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Newsroom", href: "#" },
  { label: "Contact", href: "#" },
];

const soluciones: FooterLink[] = [
  { label: "Startups", href: "#" },
  { label: "Mid-Market", href: "#" },
  { label: "Enterprise", href: "#" },
  { label: "Partners", href: "#" },
];

const legal: FooterLink[] = [
  { label: "Privacy policy", href: "#" },
  { label: "Cookie Policy", href: "#" },
  { label: "Terms of Use", href: "#" },
  { label: "Disclaimer", href: "#" },
];

const socials = [
  {
    label: "Instagram",
    path: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z",
  },
  {
    label: "TikTok",
    path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  },
  {
    label: "X",
    path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
  },
  {
    label: "WhatsApp",
    path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z",
  },
];

const FooterGroup = ({ title, links }: { title: string; links: FooterLink[] }) => (
  <div>
    <h3 className="text-base font-bold text-[#B9FFE9] sm:text-lg">{title}</h3>
    <ul className="mt-2 space-y-2">
      {links.map((link) => (
        <li key={link.label}>
          <a
            href={link.href}
            onClick={(event) => event.preventDefault()}
            className="font-semibold text-sm text-[#B9FFE9] transition-colors hover:text-[#8AD9B4]"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export const Footer = () => {
  return (
    <footer className="w-full bg-[#00361C]! text-white">
      <div className="mx-auto w-full max-w-7xl px-4 pt-10 pb-6 sm:px-6 sm:pt-12 sm:pb-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-3">
          <div className="space-y-9 sm:space-y-10">
            <FooterGroup title="Productos" links={productos} />
            <FooterGroup title="Recursos" links={recursos} />
          </div>

          <div className="space-y-9 sm:space-y-10">
            <FooterGroup title="Developers" links={developers} />
            <FooterGroup title="Compañía" links={compania} />
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-x-6 gap-y-9 sm:gap-x-8 sm:gap-y-10 lg:col-span-1 lg:block lg:space-y-10">
            <FooterGroup title="Soluciones" links={soluciones} />

            <div>
              <h3 className="text-base font-bold text-[#B9FFE9] sm:text-lg">Socials</h3>
              <div className="mt-4 flex items-center gap-3 sm:mt-5 sm:gap-5">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href="#"
                    aria-label={social.label}
                    onClick={(event) => event.preventDefault()}
                    className="text-[#57B58C] transition-colors hover:text-[#8AD9B4]"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="#B9FFE9"
                      aria-hidden="true"
                      className="size-6 sm:size-8"
                    >
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>

              <nav
                aria-label="Legal"
                className="mt-5 flex flex-wrap gap-x-4 gap-y-2 sm:mt-7 sm:gap-x-5"
              >
                {legal.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(event) => event.preventDefault()}
                    className="text-xs text-[#B9FFE9E5]/90 transition-colors hover:text-[#8AD9B4] sm:text-sm"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center sm:mt-14">
          <img
            src="/images/logo-eco-dark.png"
            alt="EcoBite"
            width={1201}
            height={215}
            loading="lazy"
            className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-5xl"
          />
          <p className="mt-2 text-center text-sm font-semibold text-[#4FAF86] sm:text-lg">
            © 2026 ecobite Inc. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};
