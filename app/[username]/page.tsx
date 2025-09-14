import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PublicProfile } from "@/components/profile/public-profile"
import type { Metadata } from "next"

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params

  const supabase = await createClient()
  if (!supabase) {
    return {
      title: "Profile Not Found - Arionys Profile",
      description: "The requested profile could not be found.",
    }
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).single()

  if (!profile || !profile.is_public) {
    return {
      title: "Profile Not Found - Arionys Profile",
      description: "The requested profile could not be found.",
    }
  }

  const { data: blocks } = await supabase
    .from("profile_blocks")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("is_visible", true)
    .order("position")

  const skills: string[] = []
  const achievements: string[] = []
  const experiences: string[] = []
  const projects: string[] = []
  const education: string[] = []
  const certifications: string[] = []
  const languages: string[] = []
  const interests: string[] = []

  blocks?.forEach((block) => {
    if (block.block_type === "skill" && block.content?.entries) {
      block.content.entries.forEach((skill: any) => {
        if (skill.name) skills.push(skill.name)
      })
    }
    if (block.block_type === "achievement" && block.content?.entries) {
      block.content.entries.forEach((achievement: any) => {
        if (achievement.title) achievements.push(achievement.title)
        if (achievement.description) achievements.push(achievement.description.slice(0, 50))
      })
    }
    if (block.block_type === "experience" && block.content?.entries) {
      block.content.entries.forEach((exp: any) => {
        if (exp.company) experiences.push(exp.company)
        if (exp.position) experiences.push(exp.position)
        if (exp.description) experiences.push(exp.description.slice(0, 50))
      })
    }
    if (block.block_type === "project" && block.content?.entries) {
      block.content.entries.forEach((project: any) => {
        if (project.title) projects.push(project.title)
        if (project.description) projects.push(project.description.slice(0, 50))
        if (project.technologies) projects.push(...project.technologies.slice(0, 3))
      })
    }
    if (block.block_type === "education" && block.content?.entries) {
      block.content.entries.forEach((edu: any) => {
        if (edu.institution) education.push(edu.institution)
        if (edu.degree) education.push(edu.degree)
        if (edu.field) education.push(edu.field)
      })
    }
    if (block.block_type === "text" && block.content?.text) {
      const textContent = block.content.text.slice(0, 100)
      if (textContent.toLowerCase().includes("certified") || textContent.toLowerCase().includes("certificate")) {
        certifications.push(textContent.split(" ").slice(0, 5).join(" "))
      }
    }
    if (block.block_type === "contact" && block.content) {
      if (block.content.email) interests.push("contact available")
      if (block.content.phone) interests.push("phone consultation")
    }
  })

  const skillsText = skills.length > 0 ? ` Expert in: ${skills.slice(0, 8).join(", ")}` : ""
  const achievementsText = achievements.length > 0 ? ` Achievements: ${achievements.slice(0, 4).join(", ")}` : ""
  const experienceText = experiences.length > 0 ? ` Experience at: ${experiences.slice(0, 4).join(", ")}` : ""
  const projectsText = projects.length > 0 ? ` Projects: ${projects.slice(0, 4).join(", ")}` : ""
  const educationText = education.length > 0 ? ` Education: ${education.slice(0, 3).join(", ")}` : ""

  const enhancedDescription = `${profile.bio || `Professional profile of ${profile.display_name || username}`}${skillsText}${achievementsText}${experienceText}${projectsText}${educationText}. Connect with ${profile.display_name || username} on Arionys Profile.`

  const keywords = [
    profile.display_name || username,
    username,
    profile.location,
    ...skills.slice(0, 15),
    ...achievements.slice(0, 8),
    ...experiences.slice(0, 8),
    ...projects.slice(0, 8),
    ...education.slice(0, 5),
    "professional profile",
    "portfolio",
    "hire",
    "consultant",
    "expert",
    "Arionys Profile",
  ]
    .filter(Boolean)
    .join(", ")

  return {
    title: `${profile.display_name || username} - ${skills.slice(0, 3).join(", ") || "Professional"} | Arionys Profile`,
    description: enhancedDescription.slice(0, 160),
    keywords,
    authors: [{ name: profile.display_name || username }],
    creator: profile.display_name || username,
    publisher: "Arionys Profile",
    icons: profile.avatar_url
      ? {
          icon: profile.avatar_url,
          shortcut: profile.avatar_url,
          apple: profile.avatar_url,
        }
      : undefined,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: `${profile.display_name || username} - ${skills.slice(0, 2).join(" & ") || "Professional"}`,
      description: enhancedDescription.slice(0, 200),
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${username}`,
      siteName: "Arionys Profile",
      images: profile.avatar_url
        ? [
            {
              url: profile.avatar_url,
              width: 1200,
              height: 630,
              alt: `${profile.display_name || username}'s profile picture`,
            },
          ]
        : [
            {
              url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-default.png`,
              width: 1200,
              height: 630,
              alt: "Arionys Profile Profile",
            },
          ],
      locale: "en_US",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${profile.display_name || username} - ${skills.slice(0, 2).join(" & ") || "Professional"}`,
      description: enhancedDescription.slice(0, 200),
      images: profile.avatar_url ? [profile.avatar_url] : [`${process.env.NEXT_PUBLIC_SITE_URL}/og-default.png`],
      creator: `@${username}`,
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/${username}`,
    },
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params

  const supabase = await createClient()
  if (!supabase) {
    notFound()
  }

  console.log("[v0] Looking for profile with username:", username)

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single()

  console.log("[v0] Profile query result:", { profile, profileError })

  if (profileError || !profile) {
    console.log("[v0] Profile not found or error occurred")
    notFound()
  }

  // Check if profile is public
  if (!profile.is_public) {
    console.log("[v0] Profile is not public")
    notFound()
  }

  // Fetch profile blocks
  const { data: blocks } = await supabase
    .from("profile_blocks")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("is_visible", true)
    .order("position")

  console.log("[v0] Profile blocks found:", blocks?.length || 0)

  const skillsData =
    blocks
      ?.filter((b) => b.block_type === "skill")
      .flatMap((b) => b.content?.entries?.map((s: any) => s.name))
      .filter(Boolean) || []
  const achievementsData =
    blocks
      ?.filter((b) => b.block_type === "achievement")
      .flatMap((b) => b.content?.entries?.map((a: any) => a.title))
      .filter(Boolean) || []
  const experienceData = blocks?.filter((b) => b.block_type === "experience").flatMap((b) => b.content?.entries) || []
  const projectsData = blocks?.filter((b) => b.block_type === "project").flatMap((b) => b.content?.entries) || []
  const educationData = blocks?.filter((b) => b.block_type === "education").flatMap((b) => b.content?.entries) || []

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.display_name || username,
    alternateName: username,
    description: profile.bio,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/${username}`,
    image: profile.avatar_url,
    sameAs: profile.website_url ? [profile.website_url] : [],
    address: profile.location
      ? {
          "@type": "PostalAddress",
          addressLocality: profile.location,
        }
      : undefined,
    telephone: profile.phone,
    jobTitle: experienceData[0]?.position,
    worksFor: experienceData[0]?.company
      ? {
          "@type": "Organization",
          name: experienceData[0].company,
        }
      : undefined,
    knowsAbout: skillsData.slice(0, 15),
    award: achievementsData.slice(0, 8),
    alumniOf: educationData
      .map((edu: any) => ({
        "@type": "EducationalOrganization",
        name: edu.institution,
      }))
      .slice(0, 3),
    hasCredential: educationData
      .map((edu: any) => ({
        "@type": "EducationalOccupationalCredential",
        credentialCategory: edu.degree,
        educationalLevel: edu.field,
      }))
      .slice(0, 3),
    mainEntityOfPage: projectsData
      .map((project: any) => ({
        "@type": "CreativeWork",
        name: project.title,
        description: project.description,
        url: project.link,
      }))
      .slice(0, 5),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <PublicProfile profile={profile} blocks={blocks || []} />
    </>
  )
}
