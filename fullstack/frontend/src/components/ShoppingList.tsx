import { KeyboardEvent, useEffect, useState } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './ShoppingList.css'
function ShoppingList() {

    interface Product{
    id:number
    userId: number;
    ingredients: string;
    }

    const [inputValue, setInputValue] = useState<string>('');
    const [products, setProducts] = useState<Product[]>([]);
    const [checkedItems, setCheckedItems] = useState<boolean[]>([]);

    useEffect(() => {
        const userId = localStorage.getItem('userId')
        console.log(userId);

        if (userId) {
            fetch(`http://localhost:3032/foodschedule/items/${userId}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`)
                    }
                    return response.json()
                })
                .then((data) => setProducts(data))
                // Uppdaterar tillståndet 'meals' med den hämtade datan

                .catch((error) => console.error(error))
            // Hanterar eventuella fel som uppstår under hämtningen
        } else {
            console.error('User ID not found in localStorage')
        }
    }, [])

    const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key != 'Enter' || inputValue == '') {
            return;
        }

        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.error('User ID not found in localStorage');
            return;
        }
        try {
            const response = await fetch(`http://localhost:3032/foodschedule/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ingredients: inputValue, userId }),
            });

            if (response.ok) {
                console.log('Inköpsprodukt sparad i databasen');
                setInputValue('');


                // Hämta den uppdaterade listan från servern
                fetch(`http://localhost:3032/foodschedule/items/${userId}`)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    // .then((data) => setProducts(data))
                    .then((data) => {
                    // Lägg till den nya produkten i den befintliga listan av produkter
                    const updatedProducts = [...products, data];
                    setProducts(updatedProducts);
                })
                    .catch((error) => console.error(error));
            } else {
                console.error('Något gick fel vid sparande av inköpsprodukten:', response.statusText);
            }
        } catch (error) {
            console.error('Något gick fel:', error);
        }
    };

    const handleCheckboxChange = (index: number) => {
        const updatedCheckedItems = [...checkedItems];
        updatedCheckedItems[index] = !updatedCheckedItems[index];
        setCheckedItems(updatedCheckedItems);
    };

      const deleteProduct = async (itemId: number) => {
        try {
            // Skicka en DELETE-begäran till backend för att ta bort produkten med det angivna ID:t
            const response = await fetch(`http://localhost:3032/foodschedule/items/${itemId}`, {
                method: 'DELETE',
            });

            // Kontrollera om begäran lyckades (statuskod 200)
            if (response.ok) {
                console.log('Product deleted successfully');
                const updatedProducts = products.filter(product => product.id !== itemId);
                setProducts(updatedProducts)
                // Uppdatera frontend för att reflektera borttagningen av produkten
                // Du kan till exempel uppdatera state för produkter eller göra en ny API-anrop för att hämta uppdaterad data
            } else {
                console.error('Error deleting product:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    return (
        <div className='mt-5 ms-5'>
            <input type="text" placeholder="Add shopping item" className='form-control w-25 p-2'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
            ></input>
            <h3 className='mt-3 display-6'>Shopping list</h3>

            <ul className='w-25 list-group list-group-flush'>
                {products.map((item, index) => (
                    <li key={index} className='list-group-item d-flex justify-content-between'>
                        <input className="form-check-input" type="checkbox"
                            checked={checkedItems[index]}
                            onChange={()=> handleCheckboxChange(index)}
                        />
                        {item.ingredients}
                        <button className='btn btn-outline-danger' onClick={()=> deleteProduct(item.id)}><i className=" bi bi-trash"></i></button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default ShoppingList;
