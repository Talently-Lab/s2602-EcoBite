import { Button } from "@/components/ui/button"

const Dashboard = () => {
  return (
    <div className="min-h-screen grid place-items-center">
      <p>Vista del Dashboard</p>
      <div className="grid grid-cols-2 gap-2 mt-4">
        <Button variant="default" className="w-60 cursor-pointer">Botón</Button>
        <Button variant="outline" className="w-60 cursor-pointer">Botón</Button>
        <Button variant="secondary" className="w-60 cursor-pointer">Botón</Button>
        <Button variant="ghost" className="w-60 cursor-pointer">Botón</Button>
        <Button variant="destructive" className="w-60 cursor-pointer">Botón</Button>
      </div>
    </div>
  )
}

export default Dashboard