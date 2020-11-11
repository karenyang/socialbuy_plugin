import React, {
    Component
} from 'react';
import {
    Grid,
    Typography,
    Card,
    Paper
} from '@material-ui/core';
import CardActionArea from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';
import Draggable from 'react-draggable';
import fetchLikedProductInfo from './modules/fetch_product';
// import "./sidebox.css";

const pink_heart = "https://crissov.github.io/unicode-proposals/img/pink-heart_emojitwo.svg";
const red_heart = "https://crissov.github.io/unicode-proposals/img/2764_emojitwo.svg";

const icon = "https://lh3.googleusercontent.com/7RD2Vgs9Xpieti3nKf9IWQeq8nd7hIR_-zVdwHdzw87CsDT_TfstQSunauqnbWjgqA1WjhI=s85";
class SideBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            liked: false,
            transition: "",
            cursor: "default",
        }
    }

    onMouseOver = () => {
        console.log("mouse over. ")
        this.setState({
            cursor: "pointer",
            transform: "translate(-50px, 0px)",
        });
    }

    onMouseLeave = () => {
        console.log("mouse leave. ")
        this.setState({
            transform: "translate(0px, 0px)",
        });
    }

    onClick= () => {
        console.log("mouse click. ");

        this.setState({
            liked: !this.state.liked,
        })

        let product_info = fetchLikedProductInfo();
        console.log("get product info: ", product_info);
        
    }




    render() {
        return (
            <Draggable axis="y">
                <div style={{ display: "inline-block", top: "200px", right: "0px", margin: "0px", position: "fixed", zIndex: 285, cursor: this.state.cursor }}
                    onMouseOver={this.onMouseOver} onMouseLeave={this.onMouseLeave} onClick={this.onClick}>
                    {/* <CardActionArea> */}
                    <img alt="icon" draggable="false" src={icon} width="56" height="56" style={{ position: "relative", zIndex: 288, transform: this.state.transform, transition: "transform 0.3s" }} />
                    
                    <img alt={"heart"} src={this.state.liked? red_heart : pink_heart} width="40" height="40" style={{ position: "absolute", top: "8px", right: "8px", margin: "0px", backgroundColor: "white", zIndex: 287 }} />
                    {/* </CardActionArea> */}

                </div>
            </Draggable>
        )
    }
}

export default SideBox;
