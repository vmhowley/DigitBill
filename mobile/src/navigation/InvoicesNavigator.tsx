
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CreateInvoiceScreen from '../screens/CreateInvoiceScreen';
import InvoicesScreen from '../screens/InvoicesScreen';

const Stack = createNativeStackNavigator();

const InvoicesNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="InvoicesList" component={InvoicesScreen} />
            <Stack.Screen name="CreateInvoice" component={CreateInvoiceScreen} />
        </Stack.Navigator>
    );
};

export default InvoicesNavigator;
