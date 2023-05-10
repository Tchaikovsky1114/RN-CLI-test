import { StyleProp, StyleSheet, Text, TextStyle, View } from 'react-native'
import React from 'react'

interface NewTextProps {
  style?: StyleProp<TextStyle>,
  text?: string
}


const NewText = ({style,text}:NewTextProps) => {
  return (
    <View>
      <Text style={style}>{text}</Text>
    </View>
  )
}

export default NewText

const styles = StyleSheet.create({})