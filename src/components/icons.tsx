import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";

export const QuickStartIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M14.5 2c-3.5 3-6 6.5-6.5 11L4 17l1 1 4-4c4.5-.5 8-3 11-6.5-1-3-3-4.5-5.5-5.5zM6 15l3 3-1 1-3.5-1.5L6 15zm9.5-8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
  </SvgIcon>
);

export const DashboardGridIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
  </SvgIcon>
);

export const EtlIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="12" cy="18" r="3" />
    <path d="M8.5 7.5L11 15.5M15.5 7.5L13 15.5M9 6h6" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </SvgIcon>
);

export const ReverseEtlIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M7 7h8l-2.5-2.5L14 3l5 5-5 5-1.5-1.5L15 9H7V7zm10 10H9l2.5 2.5L10 21l-5-5 5-5 1.5 1.5L9 15h8v2z" />
  </SvgIcon>
);

export const OrchestrationIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <circle cx="6" cy="5" r="2.2" />
    <circle cx="18" cy="5" r="2.2" />
    <circle cx="12" cy="19" r="2.2" />
    <path d="M6 7.2V13a2 2 0 0 0 2 2h2M18 7.2V13a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </SvgIcon>
);

export const TransformationsIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M7 4h8l3 3-3 3H9V8H7V4zm10 16H9l-3-3 3-3h8v2h2v4z" />
  </SvgIcon>
);

export const WarehousesIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M4 4h16v4H4V4zm0 6h16v4H4v-4zm0 6h16v4H4v-4z" />
  </SvgIcon>
);

export const AskNeoIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2zM19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z" />
  </SvgIcon>
);

export const SettingsIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.6 7.6 0 0 0-1.7-1L14.9 3H9.1l-.4 2.9a7.6 7.6 0 0 0-1.7 1l-2.5-1-2 3.5L4.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1c.5.4 1.1.8 1.7 1l.4 2.9h5.8l.4-2.9c.6-.2 1.2-.6 1.7-1l2.5 1 2-3.5L19.4 13zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z" />
  </SvgIcon>
);

export const SearchIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5L20.5 19l-5-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z" />
  </SvgIcon>
);

export const ExpandMoreIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M7 10l5 5 5-5z" />
  </SvgIcon>
);

export const WorkOutlineIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM10 5h4v2h-4V5z" />
  </SvgIcon>
);

export const HelpOutlineIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm.9 15h-1.8v-1.8h1.8V17zm1.9-6.9c-.5.6-.9 1-1.1 1.6-.1.3-.2.6-.2 1.2h-1.8c0-.7.1-1.3.3-1.8.2-.5.6-1 1.1-1.6.4-.4.7-.7.9-1a1.8 1.8 0 0 0 .3-1c0-1-.8-1.7-1.9-1.7-1 0-1.8.6-1.9 1.6H8.7c.1-2 1.6-3.2 3.6-3.2 2.1 0 3.6 1.3 3.6 3.1 0 .8-.3 1.4-1.1 2.3z" />
  </SvgIcon>
);

export const NotificationsIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M12 22a2.2 2.2 0 0 0 2.2-2.2h-4.4A2.2 2.2 0 0 0 12 22zm7-6v-5a7 7 0 0 0-5.5-6.8V3a1.5 1.5 0 0 0-3 0v1.2A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2z" />
  </SvgIcon>
);

export const ChevronLeftIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M15.4 7.4L14 6l-6 6 6 6 1.4-1.4L10.8 12z" />
  </SvgIcon>
);

export const OpenInNewIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M14 3v2h3.6l-9.8 9.8 1.4 1.4L19 6.4V10h2V3h-7zM19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7z" />
  </SvgIcon>
);
