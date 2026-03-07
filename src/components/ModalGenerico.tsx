import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';

interface ModalGenericoProps {
    visible: boolean;
    onClose: () => void;
    titulo: string;
    children: React.ReactNode;
}

export const ModalGenerico = ({ visible, onClose, titulo, children }: ModalGenericoProps) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.container}
                    >
                        <View style={styles.content}>
                            <View style={styles.header}>
                                <Text style={styles.title}>{titulo}</Text>
                                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    <Icon name="close" size={24} color={colors.mutedText} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.body}>
                                {children}
                            </View>
                        </View>
                    </KeyboardAvoidingView>

                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '90%',
        maxWidth: 400,
    },
    content: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 20,
        elevation: 5, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        paddingBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.primary,
    },
    body: {
        paddingTop: 5,
    }
});