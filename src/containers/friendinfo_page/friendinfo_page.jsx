console.log("enter friendinfo_page")
import React from 'react';
import logo from '../../assets/img/logo.svg';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

class FriendInfoPage extends React.Component {
    constructor(props) {
        super(props);
        // this.state = {
        //     user_name: "",
        //     user_id: "",
        // };
        console.log("Props: ", this.props);
    }

    render() {
        return (
            <div>
                <img src={logo} alt="icon" />
                <IconButton onClick={() => {this.props.history.goBack()} }>
                    <ArrowBackIcon />
                </IconButton>
                <p> Hello! I am {this.props.match.params.user_id} </p>

            </div>
        )
    }
};

export default FriendInfoPage;
