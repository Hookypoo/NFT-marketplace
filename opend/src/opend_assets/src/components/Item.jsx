import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { Principal } from "@dfinity/principal";
import { opend } from "../../../declarations/opend";
import Button from "./Button";

function Item(props) {
  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState();

    const id = props.id;     

    const localHost = "http://172.21.185.243:8080/";
    const agent = new HttpAgent({host: localHost});
    //#TODO  remove the following line when deploying live
    agent.fetchRootKey();
    // let NFTActor;

    async function loadNFT() {
      const NFTActor = await Actor.createActor(idlFactory, { 
      agent,
      canisterId: id,
    })

    const name = await NFTActor.getName();        
    const owner = await NFTActor.getOwner(); 
    const imageData = await NFTActor.getAsset(); 
    const imageContent = new Uint8Array(imageData);
    const image = URL.createObjectURL(new Blob([imageContent.buffer], {type: "image/png" }));

    setName(name); 
    setOwner(owner.toText());
    setImage(image);

    console.log("hello hooky");

    const nftListed = await opend.isListed(props.id);

    if(nftListed) {
      setOwner("OpenD");
      setBlur({filter: "blur(4px)"});
    } else {
      setButton(<Button handleClick={handleSell} text={"Sell"}/>);
    }
  }

  useEffect(() => {
    loadNFT();
  }, []);
  
  let price;
  function handleSell() {
    console.log("sell button clicked");

    setPriceInput(<input
      placeholder="Price in DANG"
      type="number"
      className="price-input"
      value={price}
      onChange={(e) => price=e.target.value}
    />);
    setButton(<Button handleClick={sellItem} text={"Confirm"}/>);  
  }

  async function sellItem() {
    setBlur({filter: "blur(4px)"});
    setLoaderHidden(false);
    console.log("set price = " + price);
    const listingResult = await opend.listItem(props.id, Number(price));
    console.log("listing: " + listingResult)
    if(listingResult == "success") {
      const openDId = await opend.getOpenDCanisterID();
      const transferResult = await NFTActor.transferOwnership(openDId);

      console.log("transfer: " + transferResult);

      if(transferResult == "Success") {
        setLoaderHidden(true);
        setButton();
        setPriceInput();
        setOwner("OpenD");
      }
    }
  };

  return (
    <div className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={ image }
          style={blur}
        />
        <div className="lds-ellipsis" hidden={loaderHidden}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
      </div>
        <div className="disCardContent-root">
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            { name }<span className="purple-text"></span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: { owner }
          </p>
          {priceInput}
         {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
