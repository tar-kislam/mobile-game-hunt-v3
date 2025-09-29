'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserAvatarTooltip } from '@/components/ui/user-avatar-tooltip';
import { 
  ChevronDown, 
  ChevronUp, 
  Users, 
  ExternalLink,
  Twitter,
  Github,
  Linkedin,
  Globe,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Maker {
  id: string;
  role: string;
  isCreator: boolean;
  user?: {
    id: string;
    name: string | null;
    image?: string | null;
    username?: string | null;
  } | null;
  email?: string | null;
}

interface MeetTheTeamCardProps {
  makers: Maker[];
}

export function MeetTheTeamCard({ makers }: MeetTheTeamCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't render if no makers
  if (!makers || makers.length === 0) {
    return null;
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'MAKER': return 'Maker';
      case 'DESIGNER': return 'Designer';
      case 'DEVELOPER': return 'Developer';
      case 'PUBLISHER': return 'Publisher';
      case 'HUNTER': return 'Hunter';
      default: return role;
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
      case 'x':
        return <Twitter className="w-4 h-4" />;
      case 'github':
        return <Github className="w-4 h-4" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      case 'website':
      case 'web':
        return <Globe className="w-4 h-4" />;
      case 'email':
      case 'mail':
        return <Mail className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  return (
    <Card className="rounded-xl shadow-lg bg-gradient-to-br from-gray-900/80 via-gray-800/90 to-gray-900/80 backdrop-blur-sm border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-800/50 transition-colors duration-200 rounded-t-xl"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold text-white">
              Meet the Team
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
              {makers.length} member{makers.length !== 1 ? 's' : ''}
            </Badge>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <CardContent className="pt-0 pb-6">
              <div className="space-y-4">
                {makers.map((maker, index) => (
                  <motion.div
                    key={maker.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 transition-colors duration-200"
                  >
                    {/* Avatar and Name - Interactive Area */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Avatar */}
                      {maker.user ? (
                        // Registered user - show profile hover card
                        <UserAvatarTooltip
                          userId={maker.user.id}
                          userName={maker.user.name}
                          userImage={maker.user.image || null}
                          userUsername={maker.user.username}
                          size="md"
                          className="border-2 border-purple-500/30 hover:border-purple-400/60 transition-all duration-200"
                        />
                      ) : (
                        // Non-registered user - show email tooltip
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Avatar className="w-12 h-12 border-2 border-purple-500/30 hover:border-purple-400/60 transition-all duration-200 cursor-pointer">
                                <AvatarImage 
                                  src="" 
                                  alt={maker.email || 'Team Member'} 
                                />
                                <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white font-semibold">
                                  {maker.email?.charAt(0) || 'T'}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent 
                              side="bottom" 
                              className="bg-gray-900/95 backdrop-blur-sm border-gray-700 text-white p-3 z-[9999] animate-in fade-in-0 zoom-in-95"
                              sideOffset={8}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-purple-400" />
                                  <span className="text-sm font-medium">Contact Email</span>
                                </div>
                                <div className="text-sm text-gray-300 break-all">
                                  {maker.email || 'No email provided'}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {/* Maker Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {maker.user ? (
                            // Registered user - clickable name
                            <Link 
                              href={maker.user.username ? `/@${maker.user.username}` : `/${maker.user.id}`}
                              className="font-semibold text-white truncate hover:text-purple-300 transition-colors duration-200"
                            >
                              {maker.user.name || 'Team Member'}
                            </Link>
                          ) : (
                            // Non-registered user - non-clickable name
                            <h4 className="font-semibold text-white truncate">
                              {maker.email || 'Team Member'}
                            </h4>
                          )}
                          {maker.isCreator && (
                            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                              Creator
                            </Badge>
                          )}
                        </div>
                        
                        <Badge variant="outline" className="text-xs bg-gray-700/50 text-gray-300 border-gray-600 mb-2">
                          {getRoleDisplayName(maker.role)}
                        </Badge>

                        {/* Social Links - Placeholder for future implementation */}
                        <div className="flex items-center gap-2 mt-2">
                          {/* This would be populated with actual social links from maker data */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
                            disabled
                          >
                            <Twitter className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
                            disabled
                          >
                            <Github className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
                            disabled
                          >
                            <Linkedin className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <p className="text-xs text-gray-400 text-center">
                  Hover over team members to see their profiles or contact info
                </p>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
