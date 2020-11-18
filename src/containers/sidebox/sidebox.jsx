import React, {
    Component
} from 'react';
import {
    Button,
    Typography,
    Card,
    Divider,
} from '@material-ui/core';
import CardActionArea from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Draggable from 'react-draggable';
import "./sidebox.css";

const icon_url = "https://lh3.googleusercontent.com/1IJ60N360-Z6JxbS77UnKYPug2JmjXd40vX0-PRkT1VbjB4GGxLF1gfXMCiPs09Hj-2Lfo8=s85";

class SideBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            liked: false,
            show_product: false,
            cursor: "default",
            product: this.props.product,
            added_product: false,
        }
    }

    componentDidMount = () => {
        // TODO: check whether product has been added to like list before

        document.getElementById("buy-now-button").addEventListener("click", function () {
            console.log(
                "Clicked Buy Now Button."
            )
            chrome.runtime.sendMessage({ type: "onBoughtProductsToBeAdded", data: [product] },
                    function (response) {
                        console.log('Sidebox: is the response from the background page for the  onBoughtProductsToBeAdded  Event', response.data);
                        if (response.status === 200) {
                            console.log("onBoughtProductsToBeAdded", " succeeded.", response.data);
                        } else {
                            console.log("onBoughtProductsToBeAdded", " failed.", response.data);
                        }
                    }
                );

          });


    }

    onMouseOverIcon = () => {
        this.setState({
            transform: "translate(0px, 50px)",
            show_product: true,
        });
    }

    onMouseLeaveIcon = () => {
        this.setState({
            transform: "translate(0px, 0px)",
        });
    }

    onMouseLeaveBlock = () => {
        this.setState({
            show_product: false,
        });
    }

    onClickAddCollection = () => {
        console.log("mouse click. ");
        if (!this.state.liked && this.state.product !== null) {
            chrome.runtime.sendMessage({ type: "onLikedProductsToBeAdded", data: this.state.product },
                function (response) {
                    console.log('this is the response from the background page for onLikedProductsToBeAdded', response);
                    if (response.status === 200) {
                        console.log("onLikedProductsToBeAdded succeeded.", response.data);
                    } else {
                        console.log("onLikedProductsToBeAdded failed.", response.data);
                    }
                }
            );
        }
        this.setState({
            liked: true,
            added_product: true,
        });

    }

    cropTitle = (product_title) => {
        let title = product_title.split(" ");
        return title.slice(0, 10).join(" ");
    }

    render() {
        return (
            <Draggable>
                <div style={{ display: "inline-block", position: "fixed", top: "200px", right: "0px", margin: "0px", zIndex: 285 }} onMouseLeave={this.onMouseLeaveBlock}>
                    <CardActionArea style={{ padding: "0px" }}>
                        <img className="iconimage" alt="icon" draggable="false" src={icon_url} width="56" height="56" style={{ zIndex: 288, margin: "0px" }} onMouseOver={this.onMouseOverIcon} onMouseLeave={this.onMouseLeaveIcon} />
                    </CardActionArea>
                    {this.state.product !== null && this.state.show_product &&
                        <Card style={{ backgroundColor: "white", width: 250, position: "absolute", right: "0px", display: "flex", flexDirection: 'column', justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", flexDirection: 'row', justifyContent: "space-between" }}>
                                <img className="productimage" alt={this.state.product.product_title} src={this.state.product.product_imgurl} />
                                <CardContent style={{ paddingTop: "10px", paddingRight: "5px", paddingLeft: "5px" }} >
                                    <Typography gutterBottom variant="body2" component="h5" style={{ fontSize: 12, padding: "5px" }}>
                                        {this.cropTitle(this.state.product.product_title)}
                                    </Typography>
                                </CardContent>
                            </div>
                            <Divider />
                            <CardActionArea style={{ paddingBottom: "20px" }}>
                                {this.state.added_product ?
                                    <Button onClick={this.onClickAddCollection} style={{ textTransform: "none", width: "180px", backgroundColor: "#E9967A", color: "#F5F5DC" }} >
                                        Added
                                    </Button> :
                                    <Button onClick={this.onClickAddCollection} style={{ textTransform: "none", width: "180px", backgroundColor: "#FF6347", color: "white" }} >
                                        Add to Collection
                                    </Button>
                                }
                            </CardActionArea>
                        </Card>
                    }
                </div>
            </Draggable>

        )
    }
}

export default SideBox;