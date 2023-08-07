import { Router } from "express";
import productModel from '../models/product.models.js'

const router = Router()

const auth = (req, res, next) => {
  if (req.session.user) return next()
  return res.send('Error de autenticación')
}

// Ruta para la vista Home donde se van a mostrar todos los productos
router.get('/', auth ,async (req, res) => {
  try{
    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.limit);
    let sort = req.query.sort;
    let query = req.query.query;
    const user = req.session.user
    const isAdmin = user.role == 'admin' ? true : false

    let querySort = {};
    let queryFilter = {};


    if (!page) page = 1;
    if (!limit) limit = 10;

    if (sort === 'asc' || sort === 'desc') {
      querySort.price = sort === 'asc' ? 'asc' : 'desc';
    }
    if (query) {
      queryFilter.title = { $regex: query, $options: 'i' };
    }
    const products = await productModel.paginate(queryFilter, { page, limit, sort: querySort, lean: true });
/*     console.log(products); */
    products.prevLink = products.hasPrevPage ? `/products?page=${products.prevPage}` : ''
    products.nextLink = products.hasNextPage ? `/products?page=${products.nextPage}` : ''
    res.render('products', { products, user, isAdmin }) 
  } catch (error){
    console.log('Error al cargar los productos:', error);
    res.status(500).json({ error: 'Error al cargar los productos' });
  }
})


router.get('/create', (req, res) => {
  res.render('createProduct', {})
})

router.get('/:id', async (req, res) => {
  const id = req.params.id
  const product = await productModel.findOne({ _id: id }).lean().exec()
  console.log(product);
  res.render('productForId', { product })
})

router.get('/update/:id', async (req, res) => {
  const id = req.params.id
  const product = await productModel.findOne({ _id: id }).lean().exec()
  res.render('updateProduct', { product })
})

// Ruta para crear un nuevo producto
router.post('/', async (req, res) => {
  try {
    const newProduct = await productModel.create(req.body);
    res.redirect(`/products/${newProduct._id}`)
  } catch (error) {
    console.log('Error al crear el producto:', error);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
});

// Ruta para actualizar un producto existente
router.put('/:id', async (req, res) => {
  try {
    const updatedProduct = await productModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.json(updatedProduct);
  } catch (error) {
    console.log('Error al actualizar el producto:', error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

// Ruta para eliminar un producto existente
router.delete('/delete/:id', async (req, res) => {
  try {
    await productModel.findByIdAndRemove(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    console.log('Error al eliminar el producto:', error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

export default router;