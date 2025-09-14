import { AboutBlock } from "./blocks/about-block"
import { SocialBlock } from "./blocks/social-block"
import { ContactBlock } from "./blocks/contact-block"
import { LinkBlock } from "./blocks/link-block"
import { GalleryBlock } from "./blocks/gallery-block"
import { VideoBlock } from "./blocks/video-block"
import { AudioBlock } from "./blocks/audio-block"
import { TextBlock } from "./blocks/text-block"
import { TestimonialBlock } from "./blocks/testimonial-block"
import { EventBlock } from "./blocks/event-block"
import { SubscriptionBlock } from "./blocks/subscription-block"
import { TimezoneBlock } from "../blocks/timezone-block"
import { LocationBlock } from "./blocks/location-block"
import { CalendarBlock } from "./blocks/calendar-block"
import { ImageBlock } from "./blocks/image-block"
import { EducationBlock } from "./blocks/education-block"
import { ExperienceBlock } from "./blocks/experience-block"
import { ProjectBlock } from "./blocks/project-block"
import { AchievementBlock } from "./blocks/achievement-block"
import { SkillBlock } from "./blocks/skill-block" // Added SkillBlock import
import { ServicesBlock } from "./blocks/services-block" // Added ServicesBlock import
import { WhatsAppBlock } from "./blocks/whatsapp-block" // Added WhatsAppBlock import

interface BlockRendererProps {
  block: any
  theme?: string
  profileId?: string
}

export function BlockRenderer({ block, theme = "classic", profileId }: BlockRendererProps) {
  if (!block.is_visible) return null

  const commonProps = {
    block,
    theme,
    profileId,
  }

  switch (block.block_type) {
    case "about":
      return <AboutBlock {...commonProps} />
    case "education":
      return <EducationBlock {...commonProps} />
    case "experience":
      return <ExperienceBlock {...commonProps} />
    case "project":
      return <ProjectBlock content={block.content} />
    case "achievement":
      return <AchievementBlock {...commonProps} />
    case "skill":
      return <SkillBlock {...commonProps} />
    case "services":
      return <ServicesBlock {...commonProps} />
    case "social":
      return <SocialBlock {...commonProps} />
    case "contact":
      return <ContactBlock {...commonProps} />
    case "link":
      return <LinkBlock {...commonProps} />
    case "gallery":
      return <GalleryBlock {...commonProps} />
    case "video":
      return <VideoBlock {...commonProps} />
    case "audio":
      return <AudioBlock {...commonProps} />
    case "text":
      return <TextBlock {...commonProps} />
    case "testimonial":
      return <TestimonialBlock {...commonProps} />
    case "event":
      return <EventBlock {...commonProps} />
    case "subscription":
      return <SubscriptionBlock {...commonProps} />
    case "timezone":
      return <TimezoneBlock {...commonProps} />
    case "location":
      return <LocationBlock {...commonProps} />
    case "calendar":
      return <CalendarBlock {...commonProps} />
    case "image":
      return <ImageBlock {...commonProps} />
    case "whatsapp":
      return <WhatsAppBlock {...commonProps} />
    default:
      return null
  }
}
