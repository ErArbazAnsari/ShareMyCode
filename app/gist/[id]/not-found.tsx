import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Code } from "lucide-react"

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto text-center py-12">
      <Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-4">Gist Not Found</h1>
      <p className="text-muted-foreground mb-6">The gist you're looking for doesn't exist or has been deleted.</p>
      <div className="flex gap-4 justify-center">
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/create">Create New Gist</Link>
        </Button>
      </div>
    </div>
  )
}
