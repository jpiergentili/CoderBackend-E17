import { Router } from "express";
import cartModel from '../models/cart.models.js';

const router = Router();

// DELETE /api/carts/:cid/products/:pid
router.delete('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    console.log('Carrito ID:', cid);
    console.log('Producto ID:', pid);
  
    try {
      const cart = await cartModel.findById(cid);
    
      if (!cart) {
        return res.status(404).json({ message: 'Carrito no encontrado' });
      }
  
      if (cart.cartProducts.length === 1) {
        cart.cartProducts = [];
      } else {
        cart.cartProducts = cart.cartProducts.filter(
          (product) => product._id.toString() !== pid
        );
      }
  
      console.log('Carrito después de eliminar el producto:', cart);
  
      await cart.save();
  
      return res.json({ message: 'Producto eliminado del carrito exitosamente' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al eliminar el producto del carrito' });
    }
  });
  /* Ejemplo de request al metodo delete anterior
    http://localhost:8080/api/carts/646adb45fab3b6b69a5fa45b/products/646b909915e9a48004bd8d64    
  */

router.delete('/:cid', async (req, res) => {
    const { cid } = req.params;
    
    try {
        const cart = await cartModel.findOne({ _id: cid });
    
        if (!cart) {
        return res.status(404).json({ message: 'Carrito no encontrado' });
        }
    
        cart.cartProducts = [];
    
        await cart.save();
    
        return res.json({ message: 'Productos eliminados del carrito exitosamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al eliminar los productos del carrito' });
    }
    });
    /* Ejemplo de la request delete anterior para vaciar el carrito
        DELETE http://localhost:8080/api/carts/646adb45fab3b6b69a5fa45b  
    */

// POST /api/carts/:cid
router.post('/:cid', async (req, res) => {
    const { cid } = req.params;
    const { pid, qty } = req.body;
  
    try {
      const cart = await cartModel.findOne({ _id: cid });
  
      if (!cart) {
        return res.status(404).json({ message: 'Carrito no encontrado' });
      }
  
      const productAdded = { product: { _id: pid}, qty: qty };
      cart.cartProducts.push(productAdded);
  
      // Guardo los cambios en la base de datos
      await cart.save();
  
      return res.json({ message: 'Producto agregado al carrito exitosamente' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al agregar el producto al carrito' });
    }
  });
/* ejemplo 
http://localhost:8080/api/carts/646adb45fab3b6b69a5fa45b

{
  "pid": "646947fa7485490070fda7de",
  "qty": 3
}
*/

// PUT /api/carts/:cid
router.put('/:cid', async (req, res) => {
    const { cid } = req.params;
    
    try {
        const { cartProducts, totalAmount } = req.body;

        const updatedCart = await cartModel.findByIdAndUpdate(
            cid,
            { cartProducts, totalAmount },
            { new: true }
        );

        if (!updatedCart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }
  
        return res.json({ message: 'Carrito actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar el carrito' });
    }
});
/* Ejemplo de la request put anterior
    http://localhost:8080/api/carts/646adb45fab3b6b69a5fa45b

    {
    "_id": "646adb45fab3b6b69a5fa45b",
    "first_name": "Luisina",
    "last_name": "Vergara",
    "cartProducts": [
            {
            "product": {
                    "_id": "646947fa7485490070fda7e4"
                    },
                    "qty": 20
                    }
            ]
    }
*/

// PUT /api/carts/:cid/products/:pid
router.put('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
  
    try {
      const { qty } = req.body;
  
      const cart = await cartModel.findById(cid);
  
      if (!cart) {
        return res.status(404).json({ message: 'Carrito no encontrado' });
      }
  
      const productIndex = cart.cartProducts.findIndex(
        (product) => product._id.toString() === pid
      );
  
      if (productIndex === -1) {
        return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
      }
  
      cart.cartProducts[productIndex].qty = qty;
  
      await cart.save();
  
      return res.json({ message: 'Cantidad del producto actualizada exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al actualizar la cantidad del producto' });
    }
  });
/*  ejemplo de request put anterior: 
    http://localhost:8080/api/carts/646adb45fab3b6b69a5fa45b/products/646b909915e9a48004bd8d64
    {
        "qty": 5
        } */


export default router;
