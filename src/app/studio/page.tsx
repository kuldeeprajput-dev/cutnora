"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/modules/core/db/database";
import { objectUrlManager } from "@/modules/core/db/object-url-manager";
import { deleteStoredMediaAsset } from "@/modules/core/storage/media-asset-service";
import type { Project } from "@/modules/projects";
import { Button } from "@/shared/components/ui/Button";
import { Container } from "@/shared/components/layout/Container";
import { Plus, Film, Trash2 } from "lucide-react";
import { BrandMark } from "@/shared/components/BrandMark";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { confirm } from "@/shared/components/ui/Popup";

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
            setThumbUrl(
              objectUrlManager.createUrl(customThumbId, thumbRecord.blob),
            );
            return;
          }
        }

        // 2. Search assets belonging to this project
        const projectAssets = await db.assets
          .where("projectId")
          .equals(project.id)
          .toArray();
        const visualAsset = projectAssets.find(
          (a) => a.type === "video" || a.type === "image",
        );

        if (visualAsset) {
          if (visualAsset.thumbnailBlobId) {
            const cached = objectUrlManager.getUrl(visualAsset.thumbnailBlobId);
            if (cached) {
              if (isMounted) setThumbUrl(cached);
              return;
            }
            const thumbRecord = await db.thumbnails.get(
              visualAsset.thumbnailBlobId,
            );
            if (thumbRecord && isMounted) {
              setThumbUrl(
                objectUrlManager.createUrl(
                  visualAsset.thumbnailBlobId,
                  thumbRecord.blob,
                ),
              );
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
              setThumbUrl(
                objectUrlManager.createUrl(
                  visualAsset.blobId,
                  thumbRecord.blob,
                ),
              );
              return;
            }
            const blobRecord = await db.blobs.get(visualAsset.blobId);
            if (blobRecord && isMounted) {
              setThumbUrl(
                objectUrlManager.createUrl(visualAsset.blobId, blobRecord.blob),
              );
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
                  const thumbRecord = await db.thumbnails.get(
                    asset.thumbnailBlobId,
                  );
                  if (thumbRecord && isMounted) {
                    setThumbUrl(
                      objectUrlManager.createUrl(
                        asset.thumbnailBlobId,
                        thumbRecord.blob,
                      ),
                    );
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
                    setThumbUrl(
                      objectUrlManager.createUrl(asset.blobId, blobRecord.blob),
                    );
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
      className="group relative rounded-xl border border-studio-border bg-studio-panel p-3 transition-all hover:border-brand sm:p-4"
    >
      <div className="relative mb-3 flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-studio-border bg-studio-bg">
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
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-studio-fg group-hover:text-brand transition-colors truncate">
            {project.name}
          </h3>
          <p className="text-[11px] font-mono text-studio-muted mt-0.5">
            {project.settings.width}×{project.settings.height} (
            {project.settings.aspectRatio})
          </p>
        </div>
        <button
          type="button"
          title="Delete project"
          aria-label={`Delete ${project.name}`}
          onClick={(e) => onDelete(project.id, e)}
          className="-mr-1 -mt-1 flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-lg text-studio-muted transition-colors active:bg-studio-hover active:text-destructive sm:mr-0 sm:mt-0 sm:h-auto sm:w-auto sm:rounded-none sm:p-1 sm:active:bg-transparent sm:hover:text-destructive"
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
    const targetProject = projects.find((p) => p.id === id);
    const ok = await confirm({
      title: "Delete Project",
      message: `Are you sure you want to delete "${targetProject?.name || "this project"}"? All associated media assets and edits will be permanently removed.`,
      confirmText: "Delete Project",
      variant: "destructive",
    });
    if (!ok) return;

    const assets = await db.assets.where("projectId").equals(id).toArray();
    for (const asset of assets) {
      await deleteStoredMediaAsset(asset);
    }
    await db.projects.delete(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-dvh bg-studio-bg py-6 text-studio-fg sm:min-h-screen sm:py-12">
      <Container size="lg">
        {/* Dashboard Header */}
        <div className="mb-6 flex flex-col items-stretch gap-5 border-b border-studio-border pb-5 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-6">
          <div className="min-w-0">
            <Link href="/" className="mb-2 flex w-fit items-center gap-2">
              <BrandMark size={24} />
              <span className="text-sm font-bold tracking-tight text-studio-muted">
                Cutnora Studio
              </span>
            </Link>
            <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-studio-fg sm:text-3xl sm:leading-9">
              Local Projects
            </h1>
            <p className="mt-1 max-w-sm text-xs leading-5 text-studio-muted sm:max-w-none sm:leading-4">
              Projects stored on your local browser storage.
            </p>
          </div>

          <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:shrink-0">
            <ThemeToggle className="h-11 min-w-11 shrink-0 touch-manipulation border-studio-border bg-studio-bg px-0 text-studio-fg hover:bg-studio-hover sm:h-10 sm:min-w-10 sm:px-3" />
            <Link href="/studio/new" className="min-w-0 flex-1 sm:flex-none">
              <Button
                size="md"
                variant="primary"
                className="h-11 w-full touch-manipulation whitespace-nowrap px-4 sm:h-9 sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                <span className="sm:hidden">New Project</span>
                <span className="hidden sm:inline">Create New Project</span>
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
          <div className="rounded-2xl border border-dashed border-studio-border bg-studio-panel p-6 text-center sm:p-12">
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
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
