import type { MetadataRoute } from 'next'
import type { Project } from '@/types/projects'
import projects from '../../data/projects.json'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://chrisolsen.work'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/resume`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ]

  // Dynamic project pages
  const typedProjects = projects as Project[]
  const projectPages = typedProjects.map((project: Project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...projectPages]
}
