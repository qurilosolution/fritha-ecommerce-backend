import React from "react";


const forming = () =>{
const [formData ,setFormData] = useState({
    name:"",
    email:""
});

const handleChange =(e) =>{
    const {name , value} = e.target;
        setFormData({
            ...formData,
            [name]:value
        })
    }  

    const handleSubmit =(e) =>{
          e.preventDefault(); 
          console.log("Form Submitted")
    }
     return(
        <div> 
             <form onSubmit={handleSubmit}>
                <label htmlFor="name">
                    Name:
                </label>
                <input 
                  type="text"
                  name ="name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <label htmlFor="email">
                    Email:
                </label>
                <input 
                  type="text"
                  name="email"
                  value= {formData.email}
                  onChange={handleChange}
                />
                <button type="submit">
                    submit
                    
                </button> 
               
             </form>
        </div>
     )

}

export default forming;