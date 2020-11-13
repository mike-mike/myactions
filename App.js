/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import { SafeAreaView, StyleSheet, Button, View, Text } from 'react-native';
import Sqlite from './src/utils/sqlite';
import MyActions from './src/actions/MyActions';

export default class App extends React.Component {
  state = {actions: []}
   
  constructor(props){
    super(props);

    this.loadActions(true);
  }
   
  render(){
    return (
      <SafeAreaView style={{flex:1,paddingTop:30,direction:"rtl"}}>
        <>
        <View style={styles.buttons}>
          <View style={styles.button}>
            <Button  title="Reload" onPress={() => this.loadActions(false)} />
          </View>
        </View>

        <View style={styles.actionCards}>
          {
            this.state.actions.map((action, index) => {
              return (
                <View style={styles.actionCard} key={index}>
                  <Text style={styles.actionText}>{action.name}</Text>
                </View>
              )
            })
          }
        </View>
  
        <View style={{...styles.buttons, flex: 6}}>
        <View style={styles.button}>
          <Button  title="שיקים" onPress={() => this.saveAction(1)} />
        </View>
  
        <View style={styles.button}>
          <Button title="כרטיסי אשראי" onPress={() => this.saveAction(2)} />
        </View>
  
        <View style={styles.button}>
          <Button title="שוק ההון" onPress={() => this.saveAction(3)} />
        </View>
  
        <View style={styles.button}>
          <Button title='העברות מט"ח' onPress={() => this.saveAction(4)} />
        </View>
  
        <View style={styles.button}>
          <Button title="הלוואות" onPress={() => this.saveAction(5)} />
        </View>
  
        <View style={styles.button}>
          <Button title="משכנתאות" onPress={() => this.saveAction(6)} />
        </View>
        </View>
        </>
      </SafeAreaView>
    );
  };

  async loadActions(clear){
    await Sqlite.connect();

    if(clear)
      await MyActions.clearMyActions();

    MyActions.getItems().then(actions => {
      console.log("ACTIONS", actions);
    
      this.setState({actions: actions});
    })
  }

  async saveAction(actionId) {
    let result = await MyActions.save(actionId);

    console.log("SAVE RESULT", result)
  }
}

const styles = StyleSheet.create({
  actionCards: {
    flex:4,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  actionCard: {
    flex:1,
    flexBasis: '41%',
    flexGrow: 1,
    justifyContent: 'center',
    alignItems:'center',
    margin: 5,
    borderWidth: 1,
    borderColor:'#ccc',
    backgroundColor: '#eee',
    height:100,
  
  },
  actionText: {
    textAlign: 'center'
  },
  buttons: {
    flex:1
  },
  button:{
    marginBottom:10,
    marginStart: 60,
    marginEnd: 60
  }
});

