// import React, {
//     Component
// } from 'react';
// import PropTypes from 'prop-types';
// import {
//     AppBar,
//     Tabs,
//     Tab,
// } from '@material-ui/core';
// import { withStyles } from '@material-ui/core/styles';
// import PhoneIcon from '@material-ui/icons/Phone';
// import FavoriteIcon from '@material-ui/icons/Favorite';
// import PersonPinIcon from '@material-ui/icons/PersonPin';
// // import TabPanel from "./TabPanel";

// const useStyles = theme => ({
//     root: {
//         flexGrow: 1,
//         maxWidth: 500,
//         top: 'auto',
//         bottom: 0,
//     },
    
// });

// class Main extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             tab_index: 0,
//         }
//         console.log(this.state);
//     }

//     handleTabChange = (event, new_value) => {
//         this.setState({
//             tab_index: new_value,
//         })
//     }
//     render() {
//         const { classes } = this.props;
//         return (
//                 <AppBar square position="fixed" color="transparent" className={classes.root}>
//                     <Tabs value={this.tab_index}
//                         onChange={this.handleTabChange}
//                         variant="fullWidth"
//                         indicatorColor="primary"
//                         textColor="primary"
//                         aria-label="icon tabs example">
//                         <Tab icon={<PhoneIcon />} aria-label="phone" />
//                         <Tab icon={<FavoriteIcon />} aria-label="favorite" />
//                         <Tab icon={<PersonPinIcon />} aria-label="person" />
//                     </Tabs>
//                 </AppBar>
           
//         );
//     }
// }

// export default withStyles(useStyles)(Main)

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import SearchIcon from '@material-ui/icons/Search';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import GroupIcon from '@material-ui/icons/Group';

const useStyles = makeStyles({
    root: {
        flexGrow: 1,
        maxWidth: 500,
        top: 'auto',
        bottom: 0,
    },
});


const IconTabs = ({handleTabChange}) => {
    const classes = useStyles();
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
        handleTabChange(newValue);
    };
    
    
    return (
        <AppBar square position="fixed" color="transparent" className={classes.root}>
            <Tabs
                value={value}
                onChange={handleChange}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
                aria-label="icon tabs example"
            >
                <Tab icon={<WhatshotIcon />} aria-label="popular"  />
                <Tab icon={<SearchIcon />} aria-label="search" />
                <Tab icon={<GroupIcon />} aria-label="admin" />
            </Tabs>
        </AppBar>
    
  );
}

export default IconTabs;