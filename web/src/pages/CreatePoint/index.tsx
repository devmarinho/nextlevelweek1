import React, {useEffect, useState, ChangeEvent, FormEvent}from 'react';  
import './styles.css';
import Logo from '../../assets/logo.svg';
import {Link, useHistory} from 'react-router-dom';
import { FiArrowLeft} from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet'
import api from '../../services/api';
import Axios from 'axios';
import {LeafletMouseEvent} from 'leaflet';
import Swal from 'sweetalert2';
const CreatePoint = () => {

    interface itemsInterface {
        id: number;
        title: string;
        image_url: string;
    }
    interface ufInterface {
        sigla: string
    }

    interface cityInterface {
    nome: string
    }

    const [items, setItems] = useState<itemsInterface[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [ufInitials, setUfInitials] = useState<string[]>([]);
    const [selectedUf, setSelectedUf] = useState('AC')
    const [inputData, setInputData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    });
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedCity, setSelectedCity] = useState('0')
    const [selectedPosition, setSelectedPosition] = useState<[number,number]>([0,0])
    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        })
    },[])

    useEffect(()=>{
        Axios.get<ufInterface[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla);
            setUfInitials(ufInitials);
    })
    },[]);

   useEffect(() => {
       if(selectedUf === '0') return
       Axios.get<cityInterface[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
           const cityNames = response.data.map(city => city.nome);
            setCities(cityNames);
       })
   },[selectedUf])

   function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>) {
       const uf = event.target.value;
       setSelectedUf(uf);
   }
   function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>) {
       const city = event.target.value;
       setSelectedCity(city);
   }
   function handleMapClick(event: LeafletMouseEvent) {
       setSelectedPosition([
           event.latlng.lat,
           event.latlng.lng
       ])
   }
   function handleInputChange(event:ChangeEvent<HTMLInputElement>) {
       const {name,value} = event.target
       setInputData({...inputData,[name]:value});
   }
   function handleSelectItem(id: number) {
       const alreadySelected = selectedItems.includes(id)
       if(alreadySelected){
           const filteredItems = selectedItems.filter(item => item !== id)
           setSelectedItems(filteredItems);
       }
       else  setSelectedItems([...selectedItems,id]);
   }
   async function handleSubmit(event:FormEvent) {
       event.preventDefault();
       const { name, email, whatsapp} = inputData;
       const uf = selectedUf;
       const city = selectedCity;
       const [latitude,longitude] = selectedPosition;
       const items = selectedItems;
       const data = {
           name, email, whatsapp, uf, city, latitude, longitude, items
       };
      
      Swal.fire({
        title: 'Confirmação de envio',
        icon: 'warning',
        text: 'Você deseja enviar todas as informações?',
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonColor: '#78CC66',
        cancelButtonColor: '#d33',
        focusConfirm: false,
        confirmButtonText:
         'Sim',
        confirmButtonAriaLabel: 'Thumbs up, great!',
        cancelButtonText:
          'Não',
        cancelButtonAriaLabel: 'Thumbs down'
      }).then( (result) => {
          if (result.value) {
            api.post('points',data).then(response => {
                Swal.fire({
                    icon: 'success',
                    title: 'Os dados foram enviados!',
                    text: 'Fique a vontade para realizar outro cadastro de ponto de coleta.'
                  })

            })
            
          }
          
      })
       //await api.post('points',data);
       //history.push('/');

   }

    return (
       <div id="page-create-point">
           <header>
               <img src={Logo} alt="Ecoleta"/>

               <Link to= "/" > 
               <FiArrowLeft/>
                Voltar para home
               </Link>
           </header>

           <form onSubmit = {handleSubmit}>
               <h2>Cadastro do ponto de coleta</h2>

               <fieldset>
                   <legend>
                       <h3>Dados</h3>
                   </legend>
                   <div className="field" id="sessionDados">
                       <label htmlFor="name">Nome</label>
                       <input type="text"  name="name" id="name" onChange = {handleInputChange}/>
                   </div>
                   <div className="field-group" id="sessionEmail">
                    <div className="field">
                        <label htmlFor="email">E-mail</label>
                        <input type="email"  name="email" id="email" onChange = {handleInputChange}/>
                    </div>
                    <div className="field">
                        <label htmlFor="whatsapp">Whatsapp</label>
                        <input type="text"  name="whatsapp" id="whatsapp" onChange = {handleInputChange}/>
                    </div>
                   </div>
               </fieldset>

               <fieldset>
                   <legend>
                       <h3>Endereço</h3>
                       <span>Selecione o endereço no mapa</span>
                   </legend>

                   <Map center={[-3.7570615,-38.5585407]} zoom ={15} onClick = {handleMapClick}>
                       <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position= {selectedPosition} />
                   </Map>
                   <div className="field-group">
                       <div className="field">
                           <label htmlFor="uf" >Estado </label>
                           <select name="uf" id="uf" value = {selectedUf} onChange={handleSelectedUf}>
                               {ufInitials.map(uf => (
                                   <option key = {uf} value={uf}> {uf} </option>
                               ))}
                           </select>
                       </div>

                       <div className="field">
                           <label htmlFor="city">Cidade</label>
                           <select name="city" id="city" value = {selectedCity} onChange={handleSelectedCity}> 
                               <option value="0">Selecione sua cidade</option>
                               {cities.map(city => (
                                   <option key = {city} value={city}> {city} </option>
                               ))}
                           </select>
                           
                       </div>

                   </div>
               </fieldset>

               <fieldset>
                   <legend>
                       <h3>Itens de coleta</h3>
                       <span>Selecione um ou mais itens abaixo</span>
                   </legend>
                   <div id="itens">
                       <ul className="items-grid">
                           {items.map(item => (
                            <li key= {item.id} 
                            className = {selectedItems.includes(item.id) ? 'selected' : ''}
                            onClick = {()=>{handleSelectItem(item.id)}}>
                               <img src={item.image_url} alt="teste"/>
                               <span>{item.title}</span>
                           </li>
                           ))}
                          
                       </ul>
                   </div>
               </fieldset>
                <button type="submit" >
                    Cadastrar de ponto de Coleta
                </button>
           </form>
       </div>
    )
}

export default CreatePoint;