import { StyleSheet, useColorScheme, View, Text} from 'react-native';


function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={styles.container}>
      <Text style={styles.textoTitulo}>Assistente do professor</Text>
      <Text style={styles.texto}>Estamos em manutenção, voltaremos em breve!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor:'#F0F8FF',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoTitulo:{
    fontSize:20,
  },
  texto:{
    fontSize:14,
  }
});

export default App;
