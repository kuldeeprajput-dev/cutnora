"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/modules/core/db/database";
import { objectUrlManager } from "@/modules/core/db/object-url-manager";
import type { Project } from "@/modules/projects";
import { Button } from "@/shared/components/ui/Button";
import { Container } from "@/shared/components/layout/Container";
import { Plus, Film, Trash2 } from "lucide-react";
import { BrandMark } from "@/shared/components/BrandMark";
import { ThemeToggle } from "@/shared/components/ThemeToggle";

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadThumb() {
      try {
        // 1. Direct project thumbnail if set
        const customThumbId = (project as any).thumbnailBlobId;
        if (customThumbId) {
          const cached = objectUrlManager.getUrl(customThumbId);
          if (cached) {
            if (isMounted) setThumbUrl(cached);
            return;
          }
          const thumbRecord = await db.thumbnails.get(customThumbId);
          if (thumbRecord && isMounted) {
            setThumbUrl(objectUrlManager.createUrl(customThumbId, thumbRecord.blob));
            return;
          }
        }

        // 2. Search assets belonging to this project
        const projectAssets = await db.assets.where("projectId").equals(project.id).toArray();
        const visualAsset = projectAssets.find((a) => a.type === "video" || a.type === "image");

        if (visualAsset) {
          if (visualAsset.thumbnailBlobId) {
            const cached = objectUrlManager.getUrl(visualAsset.thumbnailBlobId);
            if (cached) {
              if (isMounted) setThumbUrl(cached);
              return;
            }
            const thumbRecord = await db.thumbnails.get(visualAsset.thumbnailBlobId);
            if (thumbRecord && isMounted) {
              setThumbUrl(objectUrlManager.createUrl(visualAsset.thumbnailBlobId, thumbRecord.blob));
              return;
            }
          }

          if (visualAsset.blobId) {
            const cached = objectUrlManager.getUrl(visualAsset.blobId);
            if (cached) {
              if (isMounted) setThumbUrl(cached);
              return;
            }
            const thumbRecord = await db.thumbnails.get(visualAsset.blobId);
            if (thumbRecord && isMounted) {
              setThumbUrl(objectUrlManager.createUrl(visualAsset.blobId, thumbRecord.blob));
              return;
            }
            const blobRecord = await db.blobs.get(visualAsset.blobId);
            if (blobRecord && isMounted) {
              setThumbUrl(objectUrlManager.createUrl(visualAsset.blobId, blobRecord.blob));
              return;
            }
          }
        }

        // 3. Fallback: Search clip asset references in tracks
        for (const track of project.tracks) {
          for (const clip of track.clips) {
            if (clip.assetId) {
              const asset = await db.assets.get(clip.assetId);
              if (asset && (asset.type === "video" || asset.type === "image")) {
                if (asset.thumbnailBlobId) {
                  const cached = objectUrlManager.getUrl(asset.thumbnailBlobId);
                  if (cached) {
                    if (isMounted) setThumbUrl(cached);
                    return;
                  }
                  const thumbRecord = await db.thumbnails.get(asset.thumbnailBlobId);
                  if (thumbRecord && isMounted) {
                    setThumbUrl(objectUrlManager.createUrl(asset.thumbnailBlobId, thumbRecord.blob));
                    return;
                  }
                }
                if (asset.blobId) {
                  const cached = objectUrlManager.getUrl(asset.blobId);
                  if (cached) {
                    if (isMounted) setThumbUrl(cached);
                    return;
                  }
                  const blobRecord = await db.blobs.get(asset.blobId);
                  if (blobRecord && isMounted) {
                    setThumbUrl(objectUrlManager.createUrl(asset.blobId, blobRecord.blob));
                    return;
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed loading project thumbnail:", err);
      }
    }

    loadThumb();

    return () => {
      isMounted = false;
    };
  }, [project]);

  return (
    <Link
      href={`/studio/${project.id}`}
      className="group relative rounded-xl border border-studio-border bg-studio-panel p-4 transition-all hover:border-brand"
    >
      <div className="aspect-video w-full rounded-lg bg-studio-bg border border-studio-border flex items-center justify-center mb-3 overflow-hidden relative">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={project.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Film className="h-8 w-8 text-studio-muted group-hover:text-brand transition-colors" />
        )}
      </div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-studio-fg group-hover:text-brand transition-colors truncate">
            {project.name}
          </h3>
          <p className="text-[11px] font-mono text-studio-muted mt-0.5">
            {project.settings.width}×{project.settings.height} ({project.settings.aspectRatio})
          </p>
        </div>
        <button
          type="button"
          title="Delete project"
          onClick={(e) => onDelete(project.id, e)}
          className="p-1 text-studio-muted hover:text-destructive transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </Link>
  );
}

export default function StudioDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const list = await db.projects.orderBy("updatedAt").reverse().toArray();
        setProjects(list);
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProjects();
  }, []);

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this local project?")) {
      await db.projects.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-studio-bg text-studio-fg py-12">
      <Container size="lg">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between border-b border-studio-border pb-6 mb-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-2">
              <BrandMark size={24} />
              <span className="text-sm font-bold tracking-tight text-studio-muted">
                Cutnora Studio
              </span>
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-studio-fg">
              Local Projects
            </h1>
            <p className="mt-1 text-xs text-studio-muted">
              Projects stored on your local browser IndexedDB storage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle className="border-studio-border bg-studio-bg text-studio-fg hover:bg-studio-hover" />
            <Link href="/studio/new">
              <Button size="md" variant="primary">
                <Plus className="h-4 w-4" /> Create New Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="py-12 text-center text-sm text-studio-muted">
            Loading local projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-studio-border bg-studio-panel p-12 text-center">
            <Film className="mx-auto h-12 w-12 text-studio-muted mb-4" />
            <h3 className="text-base font-bold text-studio-fg">
              No local projects found
            </h3>
            <p className="mt-1 text-xs text-studio-muted">
              Create a new video project to start editing in your browser.
            </p>
            <div className="mt-6">
              <Link href="/studio/new">
                <Button size="sm" variant="primary">
                  <Plus className="h-4 w-4" /> Create Project
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
