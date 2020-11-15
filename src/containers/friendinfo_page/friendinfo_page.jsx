console.log("enter friendinfo_page")
import React from 'react';
import logo from '../../assets/img/logo.svg';


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
                <p> Hello! </p>
                <img src={logo} alt="icon" />
            </div>
        )

    }
};

export default FriendInfoPage;
