import {
  BookOpen,
  ChevronDown,
  User,
  Building2,
  Sparkles,
  ExternalLink,
  Zap,
  Github,
  BookOpenText,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useTech } from '@/contexts/TechContext';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const techStackConfig = {
  react: {
    label: 'React',
    icon: '⚛️',
    quickstart: 'https://auth0.com/docs/quickstart/spa/react',
    sdkReference: 'https://auth0.github.io/auth0-react/',
    sdkLabel: 'Auth0 React SDK',
    apiReference: 'https://auth0.com/docs/api',
  },
  nextjs: {
    label: 'Next.js',
    icon: '▲',
    quickstart: 'https://auth0.com/docs/quickstart/webapp/nextjs',
    sdkReference: 'https://auth0.github.io/nextjs-auth0/',
    sdkLabel: 'Auth0 Next.js SDK',
    apiReference: 'https://auth0.com/docs/api',
  },
};

export default function Layout({ children }: LayoutProps) {
  const { selectedTech, setSelectedTech } = useTech();
  const location = useLocation();

  const navigationSections = [
    {
      title: 'Getting Started',
      icon: BookOpen,
      color: 'text-purple-500',
      href: '/',
    },
    {
      title: 'My Account',
      icon: User,
      color: 'text-blue-500',
      items: [
        { name: 'Overview', href: '/my-account' },
        { name: 'UserMFAMgmt', href: '/my-account/user-mfa-management' },
      ],
    },
    {
      title: 'My Organization',
      icon: Building2,
      color: 'text-emerald-500',
      items: [
        { name: 'Overview', href: '/my-org' },
        { name: 'OrgDetailsEdit', href: '/my-org/org-details-edit' },
        { name: 'SsoProviderTable', href: '/my-org/sso-provider-table' },
        { name: 'SsoProviderCreate', href: '/my-org/sso-provider-create' },
        { name: 'SsoProviderEdit', href: '/my-org/sso-provider-edit' },
        { name: 'DomainTable', href: '/my-org/domain-table' },
      ],
    },
  ];

  const currentTech = techStackConfig[selectedTech];

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        {/* Fixed Sidebar */}
        <Sidebar
          collapsible="none"
          className="border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          <SidebarHeader className="border-b px-4 py-4 space-y-2">
            {/* Auth0 Logo */}
            <div className="flex items-center gap-2 px-2">
              <img src="/img/auth0_light_mode.png" alt="Auth0" className="h-6 w-auto" />
              <span className="text-xs font-semibold text-muted-foreground">
                Universal Components
              </span>
            </div>

            {/* Tech Stack Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'group relative flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-sm font-medium transition-all',
                    'hover:bg-accent hover:shadow-sm',
                    'bg-background',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{currentTech.icon}</span>
                    <span>{currentTech.label}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50 transition-transform group-hover:translate-y-0.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[--radix-dropdown-menu-trigger-width] p-2"
              >
                <DropdownMenuItem
                  onClick={() => setSelectedTech('react')}
                  className="cursor-pointer rounded-md px-3 py-2 font-medium"
                >
                  <span className="mr-2">⚛️</span>
                  React
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedTech('nextjs')}
                  className="cursor-pointer rounded-md px-3 py-2 font-medium"
                >
                  <span className="mr-2">▲</span>
                  Next.js
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarHeader>

          <SidebarContent className="px-3 py-4">
            {navigationSections.map((section) => {
              const Icon = section.icon;

              if ('href' in section) {
                const isActive = location.pathname === section.href;
                return (
                  <SidebarGroup key={section.title} className="mb-1">
                    <SidebarGroupContent>
                      <SidebarMenu>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            className={cn(
                              'relative rounded-md transition-all duration-200',
                              isActive && 'bg-primary/10 font-medium shadow-sm',
                            )}
                          >
                            <Link
                              to={section.href ?? '/'}
                              className="flex items-center gap-3 px-3 py-2.5"
                            >
                              <Icon className={cn('h-4 w-4', section.color)} />
                              <span className="font-semibold">{section.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                );
              }

              return (
                <SidebarGroup key={section.title} className="mb-1">
                  <SidebarGroupLabel className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold">
                    <Icon className={cn('h-4 w-4', section.color)} />
                    <span className="font-semibold">{section.title}</span>
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu className="space-y-0.5">
                      {section.items.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                          <SidebarMenuItem key={item.name}>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive}
                              className={cn(
                                'relative rounded-md transition-all duration-200',
                                isActive && 'bg-primary/10 font-medium shadow-sm',
                              )}
                            >
                              <Link to={item.href} className="flex items-center gap-2 px-4 py-2">
                                <span>{item.name}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              );
            })}
          </SidebarContent>
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="md:hidden" />
              <div className="flex flex-1 items-center justify-between">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Universal Components
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                    <Sparkles className="h-3 w-3" />
                    BETA
                  </span>
                </div>

                {/* Quick Links */}
                <div className="hidden md:flex items-center gap-2">
                  <a
                    href={currentTech.quickstart}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Quickstart
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href={currentTech.sdkReference}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Github className="h-3.5 w-3.5" />
                    {currentTech.sdkLabel}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href={currentTech.apiReference}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <BookOpenText className="h-3.5 w-3.5" />
                    API Reference
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="container max-w-5xl py-8 px-6 md:px-8 mx-auto">
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
