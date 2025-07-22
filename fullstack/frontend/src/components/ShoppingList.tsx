import { KeyboardEvent, useEffect, useState } from 'react'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './ShoppingList.css'

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
    <div className="mt-5 ms-5">
      <div className='div-border'>
        <input type="text" placeholder="Add shopping item" className="form-control w-25 p-2" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} />
        <h3 className="mt-3 display-6">Shopping list</h3>

        <ul className="w-25 list-group list-group-flush">
          {products.map((item, index) => (
            <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
              <input className="form-check-input" type="checkbox" checked={item.checked} onChange={() => handleCheckboxChange(index)} />
              <span className={`ms-2 flex-grow-1 ${item.checked ? 'line-through text-secondary' : ''}`}>{item.ingredients}</span>
              <button className="btn btn-outline-danger" onClick={() => deleteProduct(item.id)}>
                <i className="bi bi-trash"></i>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ShoppingList
