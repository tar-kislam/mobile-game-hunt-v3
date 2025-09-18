import RichTextRenderer from "./RichTextRenderer";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Share2, Calendar, User } from "lucide-react";

interface BlogPost {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image?: string | null;
  };
}

export default function BlogDetail({ post }: { post: BlogPost }) {
  // Handle missing post
  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h1 className="text-2xl font-bold text-foreground mb-4">Post Not Found</h1>
        <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist.</p>
        <Button asChild>
          <a href="/blog">← Back to Blog</a>
        </Button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAuthorName = (user: BlogPost['user']) => {
    return user?.name || 'Anonymous';
  };

  const getAuthorImage = (user: BlogPost['user']) => {
    return user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(getAuthorName(user))}&background=6366f1&color=fff`;
  };

  // Handle empty content
  const hasContent = post.content && post.content.trim().length > 0;

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      {/* Cover Image */}
      <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-purple-600/20 to-violet-600/20">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <User className="w-12 h-12 text-purple-400" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-2">
              Blog Post
            </h1>
            <p className="text-muted-foreground">
              {post.content ? post.content.substring(0, 100) + '...' : 'No content available'}
            </p>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Author and Date */}
      <div className="flex items-center justify-between border-b pb-8 mb-8">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={getAuthorImage(post.user)} />
            <AvatarFallback>
              {getAuthorName(post.user).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">
              {getAuthorName(post.user)}
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(post.createdAt)}
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        {hasContent ? (
          <RichTextRenderer content={post.content || ''} />
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🚧</div>
            <p className="text-xl text-muted-foreground">This article is coming soon…</p>
            <p className="text-sm text-muted-foreground mt-2">Check back later for the full content.</p>
          </div>
        )}
      </div>

      {/* Tags - Since Post model doesn't have tags, we'll show a placeholder */}
      <div className="mt-8 pt-8 border-t">
        <h3 className="text-lg font-semibold text-foreground mb-4">Related Topics</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="hover:bg-accent/10 hover:border-accent">
            Mobile Games
          </Badge>
          <Badge variant="outline" className="hover:bg-accent/10 hover:border-accent">
            Gaming News
          </Badge>
          <Badge variant="outline" className="hover:bg-accent/10 hover:border-accent">
            Community
          </Badge>
        </div>
      </div>

      {/* Social Sharing */}
      <div className="mt-12 pt-8 border-t">
        <h3 className="text-lg font-semibold text-foreground mb-4">Share this post</h3>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            Share on Twitter
          </Button>
          <Button variant="outline" className="flex-1">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Share on LinkedIn
          </Button>
        </div>
      </div>
    </article>
  );
}
