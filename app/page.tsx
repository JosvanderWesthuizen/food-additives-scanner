import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Scanner from "@/components/scanner"
import History from "@/components/history"
import Search from "@/components/search"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="w-full max-w-md flex flex-col min-h-screen">
        <Tabs defaultValue="history" className="w-full flex flex-col flex-1">
          <TabsContent value="history" className="flex-1 p-0 mt-0">
            <History />
          </TabsContent>
          <TabsContent value="scanner" className="flex-1 flex flex-col p-0 mt-0">
            <Scanner />
          </TabsContent>
          <TabsContent value="search" className="flex-1 p-0 mt-0">
            <Search />
          </TabsContent>
          <TabsList className="fixed bottom-0 left-0 right-0 grid grid-cols-3 rounded-none h-16 border-t bg-background">
            <TabsTrigger value="history" className="flex flex-col gap-1 data-[state=active]:bg-muted">
              <div className="mx-auto">🕒</div>
              <span className="text-xs">History</span>
            </TabsTrigger>
            <TabsTrigger value="scanner" className="flex flex-col gap-1 data-[state=active]:bg-muted">
              <div className="mx-auto">📷</div>
              <span className="text-xs">Scan</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex flex-col gap-1 data-[state=active]:bg-muted">
              <div className="mx-auto">🔍</div>
              <span className="text-xs">Search</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </main>
  )
}
