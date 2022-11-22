let clipboard = {}

export default {
    Set: function (data) {
        this.Clear()
        clipboard = data
    },
    
    Get: function () {
        return clipboard
    },

    Clear: function () {
        clipboard = {}
    },

    IsEmpty: function () {
        return Object.keys(clipboard).length === 0 || clipboard.files.length === 0
    }
}