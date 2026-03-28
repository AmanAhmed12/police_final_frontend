import {
    Dashboard as DashboardIcon,
    Assignment as AssignmentIcon,
    EventNote as ScheduleIcon,
    Campaign as CampaignIcon,
    ContactPhone as ContactPhoneIcon,
    ReportProblem as ReportIcon,
    Settings as SettingsIcon,
    Receipt as ReceiptIcon,
    Work as WorkIcon
} from "@mui/icons-material";

export const officerNavigation = [
    { name: "Dashboard", href: "/officer", icon: <DashboardIcon /> },
    { name: "My Duties", href: "/officer/duties", icon: <WorkIcon /> },
    { name: "My Cases", href: "/officer/cases", icon: <AssignmentIcon /> },
    { name: "Reports", href: "/officer/reports", icon: <ReportIcon /> },
    { name: "Notices", href: "/officer/notices", icon: <CampaignIcon /> },
    { name: "Emergency Contacts", href: "/admin/emergency-contacts", icon: <ContactPhoneIcon /> },
    { name: "Settings", href: "/officer/settings", icon: <SettingsIcon /> },
];
