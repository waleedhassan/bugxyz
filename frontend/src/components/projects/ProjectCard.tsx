import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderKanban, Bug, Users } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link to={`/projects/${project.id}`}>
      <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{project.name}</CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs">
              {project.key}
            </Badge>
          </div>
          {project.description && (
            <CardDescription className="line-clamp-2 mt-1">
              {project.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Bug className="h-4 w-4" />
              <span>{project.bugCount} bugs</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{project.memberCount} members</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Updated {timeAgo(project.updatedAt)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
