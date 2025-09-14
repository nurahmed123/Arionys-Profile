import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Github, ExternalLink, Star } from "lucide-react"
import { type Theme, getThemeClasses } from "@/lib/themes"
import { getTextClasses } from "@/lib/text-formatting"

interface ThemePreviewProps {
  theme: Theme
}

export function ThemePreview({ theme }: ThemePreviewProps) {
  const classes = getThemeClasses(theme)

  return (
    <div className={`min-h-[600px] p-6 ${classes.background}`}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="text-center space-y-4">
          <Avatar className="h-24 w-24 mx-auto">
            <AvatarImage src="/placeholder.svg" alt="Preview User" />
            <AvatarFallback className="text-2xl">JD</AvatarFallback>
          </Avatar>
          <div>
            <h1 className={`${getTextClasses({theme: theme.id, type: "heading", size: "3xl"})} mb-2`}>John Doe</h1>
            <p className={`${getTextClasses({theme: theme.id, type: "muted", size: "lg"})} mb-2`}>@johndoe</p>
            <p className={`${getTextClasses({theme: theme.id, type: "body"})} max-w-md mx-auto`}>
              Full-stack developer passionate about creating beautiful and functional web applications.
            </p>
          </div>
        </div>

        {/* Sample Blocks */}
        <div className={classes.spacing}>
          {/* About Block */}
          <Card className={classes.card}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="h-6 w-6 text-gray-700" />
                </div>
                <div className="flex-1">
                  <h3 className={`${getTextClasses({theme: theme.id, type: "heading", size: "lg"})} mb-3`}>About Me</h3>
                  <p className={`${getTextClasses({theme: theme.id, type: "body"})} leading-relaxed`}>
                    I'm a passionate developer with 5+ years of experience building web applications. I love working
                    with modern technologies and creating user-friendly interfaces.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Block */}
          <Card className={classes.card}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                    <Github className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`${getTextClasses({theme: theme.id, type: "heading", size: "base"})}`}>GitHub</h3>
                    <p className={`text-sm ${getTextClasses({theme: theme.id, type: "muted", size: "sm"})}`}>@johndoe</p>
                  </div>
                </div>
                <ExternalLink className="h-5 w-5 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          {/* Contact Block */}
          <Card className={classes.card}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-sm flex items-center justify-center">
                    <Phone className="h-6 w-6 text-gray-700" />
                  </div>
                  <div>
                    <h3 className={`${getTextClasses({theme: theme.id, type: "heading", size: "base"})}`}>Phone</h3>
                    <p className={`text-sm ${getTextClasses({theme: theme.id, type: "body", size: "sm"})}`}>+1 (555) 123-4567</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Testimonial Block */}
          <Card className={classes.card}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-sm flex items-center justify-center flex-shrink-0">
                  <Star className="h-6 w-6 text-gray-700" />
                </div>
                <div className="flex-1">
                  <blockquote className={`${getTextClasses({theme: theme.id, type: "muted"})} italic leading-relaxed mb-4`}>
                    "John delivered exceptional work on our project. His attention to detail and technical expertise
                    made all the difference."
                  </blockquote>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gray-100 text-gray-700 text-xs">SM</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className={`text-sm ${getTextClasses({theme: theme.id, type: "heading", size: "sm"})}`}>Sarah Miller</p>
                      <p className={`text-xs ${getTextClasses({theme: theme.id, type: "muted", size: "xs"})}`}>CEO at TechCorp</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Theme Info */}
        <div className="text-center pt-6 border-t">
          <Badge variant="secondary" className="mb-2">
            {theme.name} Theme
          </Badge>
          <p className={`text-sm ${classes.muted}`}>{theme.description}</p>
        </div>
      </div>
    </div>
  )
}
