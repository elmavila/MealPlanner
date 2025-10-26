import { KeyboardEvent, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2 } from 'lucide-react'

function ShoppingList() {
  interface Product {
    id: number
    userId: number
    ingredients: string
    checked: boolean
  }

  const [inputValue, setInputValue] = useState<string>('')
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const userId = localStorage.getItem('userId')

    if (userId) {
      fetch(`http://localhost:3032/foodschedule/items/${userId}`)
        .then((response) => response.json())
        .then((data: Product[]) => {
          const formatted = data.map((item) => ({
            ...item,
            checked: Boolean(item.checked),
          }))
          setProducts(formatted)
        })
        .catch((error) => console.error('Fel vid hämtning:', error))
    }
  }, [])

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || inputValue.trim() === '') return

    const userId = localStorage.getItem('userId')
    if (!userId) return

    try {
      const response = await fetch(`http://localhost:3032/foodschedule/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: inputValue, userId }),
      })

      if (response.ok) {
        setInputValue('')
        const updated = await fetch(`http://localhost:3032/foodschedule/items/${userId}`)
        const data = await updated.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Fel vid tillägg:', error)
    }
  }

  const handleCheckboxChange = async (index: number) => {
    const updatedProducts = [...products]
    const product = updatedProducts[index]
    product.checked = !product.checked
    setProducts(updatedProducts)

    try {
      await fetch(`http://localhost:3032/foodschedule/items/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checked: product.checked }),
      })
    } catch (error) {
      console.error('Fel vid checkbox-uppdatering:', error)
    }
  }

  const deleteProduct = async (itemId: number) => {
    try {
      const response = await fetch(`http://localhost:3032/foodschedule/items/${itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const updatedProducts = products.filter((p) => p.id !== itemId)
        setProducts(updatedProducts)
      }
    } catch (error) {
      console.error('Fel vid borttagning:', error)
    }
  }

  return (
    <Card className="w-full max-w-md bg-[#FEFAE0]">
      <CardHeader>
        <CardTitle className="text-2xl text-[#6f8a4f]">Shopping List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input type="text" placeholder="Add shopping item" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} className="w-full" />

          <div className="space-y-2">
            {products.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-card bg-white/70 hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3 bg-white/70">
                  <input type="checkbox" checked={item.checked} onChange={() => handleCheckboxChange(index)} className="h-4 w-4 rounded border-gray-300 text-lime-600 focus:ring-lime-500" />
                  <span className={`flex-1 ${item.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{item.ingredients}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => deleteProduct(item.id)} className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ShoppingList
