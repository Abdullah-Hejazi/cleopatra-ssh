import { createApp } from "vue"

import PrimeVue from 'primevue/config'
import 'primevue/resources/themes/arya-orange/theme.css'
import 'primevue/resources/primevue.min.css'
// import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

// components
import Menubar from 'primevue/menubar'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'
import InputNumber from 'primevue/inputnumber'
import Tooltip from 'primevue/tooltip'
import Dialog from 'primevue/dialog'
import InlineMessage from 'primevue/inlinemessage'
import PanelMenu from 'primevue/panelmenu'
import Panel from 'primevue/panel'
import Divider from 'primevue/divider'
import Toolbar from 'primevue/toolbar'
import ProgressSpinner from 'primevue/progressspinner'
import BlockUI from 'primevue/blockui'
import Menu from 'primevue/menu'
import Breadcrumb from 'primevue/breadcrumb'
import Dropdown from 'primevue/dropdown'
import ToastService from 'primevue/toastservice'
import Toast from 'primevue/toast'
import ConfirmationService from 'primevue/confirmationservice'
import ConfirmDialog from 'primevue/confirmdialog'
import ScrollPanel from 'primevue/scrollpanel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import TabMenu from 'primevue/tabmenu'
import Paginator from 'primevue/paginator'
import ScrollTop from 'primevue/scrolltop'
import Textarea from 'primevue/textarea'
import Calendar from 'primevue/calendar'
import ContextMenu from 'primevue/contextmenu'
import FileUpload from 'primevue/fileupload'
import ProgressBar from 'primevue/progressbar'


import App from "./App.vue"
import router from "./router"
import store from '@/stores/store'
import LoadingPlugin from "@/services/loading"
import { createI18n } from 'vue-i18n'

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {ripple: true})
app.use(store)

app.component('Menubar', Menubar)
app.component('Card', Card)
app.component('Button', Button)
app.component('InputText', InputText)
app.component('Password', Password)
app.component('Checkbox', Checkbox)
app.component('InputNumber', InputNumber)
app.component('Dialog', Dialog)
// app.component('Tooltip', Tooltip)
app.component('InlineMessage', InlineMessage)
app.component('PanelMenu', PanelMenu)
app.component('Divider', Divider)
app.component('Toolbar', Toolbar)
app.component('ProgressSpinner', ProgressSpinner)
app.component('BlockUI', BlockUI)
app.component('Menu', Menu)
app.component('Panel', Panel)
app.component('Breadcrumb', Breadcrumb)
app.component('Toast', Toast)
app.component('ConfirmDialog', ConfirmDialog)
app.component('ScrollPanel', ScrollPanel)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('TabMenu', TabMenu)
app.component('Paginator', Paginator)
app.component('ScrollTop', ScrollTop)
app.component('Textarea', Textarea)
app.component('Calendar', Calendar)
app.component('ContextMenu', ContextMenu)
app.component('FileUpload', FileUpload)
app.component('ProgressBar', ProgressBar)
app.component('Dropdown', Dropdown)


app.directive('Tooltip', Tooltip)
app.use(ToastService)
app.use(ConfirmationService)

app.use(LoadingPlugin)

const i18n = createI18n({
    locale: 'English',
    messages: {
        'English': require('@/locales/en.json'),
        'العربية': require('@/locales/ar.json'),
    }
})

app.use(i18n)


app.mount("#app")
