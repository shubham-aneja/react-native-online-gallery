import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Picker, StyleSheet, Button, View, TextInput, Image, FlatList, Text, ActivityIndicator } from 'react-native';
import { Dimensions } from "react-native";
// import { Picker } from '@react-native-community/picker';

const screenWidth = Math.round(Dimensions.get('window').width);





export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            noOfItemsInRow: "2",
            isFetching: undefined /* undefined, 1, 2, false */
        };
        this.page = 1;
        this.onEndReachedCalledDuringMomentum = true;

    }

    componentDidMount() {
        setTimeout(() => {
            // this.getImagesInfoWithSearch('jio', true);
            this.page = 1;
        }, 2100)
    }

    getImagesInfoWithSearch = (searchText, isReset) => {
        // console.warn("Fetcing for text and page:"+ searchText + "..." + pageIndex)
        var pageSize = 12;
        if (searchText) {
            if (isReset) {
                this.setState({ images: [], isFetching: 1 });
                this.pageIndex = 1
            } else {
                this.setState({ isFetching: 2 });
                this.pageIndex = this.pageIndex || 1;
                this.pageIndex++;
            }

            const url = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=ca370d51a054836007519a00ff4ce59e&per_page=${pageSize}&format=json&nojsoncallback=1&text=${searchText}&page=${this.pageIndex}`
            fetch(url)
                .then(res => res.json())
                .then(res => {
                    this.searchText = searchText;
                    if (res.photos && res.photos.photo && res.photos.photo.length > 0) {
                        const imagePaths = res.photos.photo.map(photo => {
                            return {
                                title: photo.title,
                                url: this.getImagePath(photo.farm, photo.server, photo.id, photo.secret)
                            }
                        })
                        // console.log("imagePaths", imagePaths);
                        if (this.pageIndex == 1) {
                            this.setState({ images: imagePaths, isFetching: false });
                        } else {
                            const currentImages = this.state.images || [];
                            this.setState({ isFetching: false, images: [...currentImages, ...imagePaths] })
                        }

                    } else {
                        alert("No Image found, try again...");
                    }
                })
                .catch(e => {
                    this.setState({ isFetching: false });
                    // this.isFetching = false; /* console.log("Error while fetching images", e) */ 
                })
        } else {
            alert("No text entered...Kindly Add some text to search")
        }
    }

    getImagePath = (farm, server, id, secret) => {
        return `https://farm${farm}.staticflickr.com/${server}/${id}_${secret}.jpg`
    }


    render() {
        const { images = [] } = this.state;
        const noOfItemsInRow = parseInt(this.state.noOfItemsInRow);
        const width = (screenWidth - 20) / noOfItemsInRow;
        return (
            <View style={styles.container} contentContainerStyle={{ marginTop: 50, alignItems: 'center' }} >
                <TextInput
                    placeholder="Type something like India"
                    onChangeText={text => this.setState({ text })}
                    value={this.state.text}
                    style={{ borderRadius: 2, borderWidth: 2, borderColor: 'red', margin: 10, paddingLeft: 10 }} />
                <Button
                    onPress={() => { this.getImagesInfoWithSearch(this.state.text, true); }}
                    title="Done"
                    color="#841584"
                    accessibilityLabel="Press to search"
                />
                <Picker
                    selectedValue={this.state.noOfItemsInRow}
                    style={{ height: 50, width: 200 }}
                    onValueChange={(itemValue) =>
                        this.setState({ noOfItemsInRow: itemValue })
                    }>
                    <Picker.Item label="Two in a row" value="2" />
                    <Picker.Item label="Three in a row" value="3" />
                    <Picker.Item label="Four in a row" value="4" />
                    <Picker.Item label="Five in a row" value="5" />
                </Picker>
                {this.state.isFetching == 1 && <ActivityIndicator size="large" color="#0000ff" />}
                {this.state.isFetching == undefined && <Text>Type something then hit enter to search for images</Text>}
                <View style={{ display: "flex", flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly', alignItems: 'center', borderWidth: 2, borderColor: 'red' }}>
                    <MyList
                        key={"_my_list" + noOfItemsInRow}
                        images={images}
                        isFetching={this.state.isFetching == 1 || this.state.isFetching == 2}
                        isInfiniteFetching={this.state.isFetching == 2}
                        getImagesInfoWithSearch={this.getImagesInfoWithSearch}
                        searchText={this.searchText}
                        width={width}
                        noOfItemsInRow={noOfItemsInRow}
                    />




                    {/* images.map(_ => (
                        <View key={_.url} style={{ borderWidth: 2, borderColor: 'black', width: width, marginBottom: 10 }} >
                            <Image source={{ uri: _.url }} style={{ height: width - 2, width: width - 4 }} />
                        </View>
                    )) */}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50
    },
});







class MyList extends React.Component {
    constructor(props) {
        super(props);
        this.onEndReachedCalledDuringMomentum = true;
    }

    render() {
        const { images, isFetching, isInfiniteFetching, getImagesInfoWithSearch, searchText, width, noOfItemsInRow } = this.props;
        return (<FlatList
            onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false; }}
            data={images}
            renderItem={({ item: _ }) => {
                return (
                    <View style={{ borderWidth: 2, borderColor: 'black', width: width, marginBottom: 10 }} >
                        {/* <Text>{_.title}</Text> */}
                        <Image source={{ uri: _.url }} style={{ height: width - 2, width: width - 4 }} />
                    </View>
                )
            }}
            keyExtractor={(item, index) => (`${item.url}` + index)}
            numColumns={noOfItemsInRow}
            // style={{ flex: 1, flexDirection: 'row' }}
            contentContainerStyle={{ justifyContent: 'space-between', alignItems: 'center' }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
                () => {
                    if (isInfiniteFetching) {
                        return <ActivityIndicator  size="large" color="#0000ff" />
                    } else {
                        return null
                    }
                }
            }
            onEndReached={() => {
                if (!this.onEndReachedCalledDuringMomentum && !isFetching) {
                    // this.onEndReachedCalledDuringMomentum = true;
                    getImagesInfoWithSearch(searchText, false);
                }
            }}
        />)


    }
}