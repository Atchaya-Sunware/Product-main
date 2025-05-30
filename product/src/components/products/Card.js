
const   Card= (props) => {

   return( <div className="card shadow  fixed-card m-3">
    <div className="card-img-container">
    <img src={props.image} className="card-img-top" alt="product-image" />
    </div>
    
    <div className="card-body">
      <h5 className="card-title">{props.title}</h5>
      <p className="card-text">
      {props.description}
      </p>
      <button href="#" className="btn  cartButton">
      Add to Cart
      </button>
    </div>
  </div>
   )
   

}

export default Card;