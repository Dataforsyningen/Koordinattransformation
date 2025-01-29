import { defineStore } from 'pinia'
import { mapCoorToList } from '../helperfunctions'

export const useKtStore = defineStore('KtStore', {
  state: () => ({
    // Base URL and path for the web project, derived from environment variables
    webproj: `${import.meta.env.VITE_API_BASE_URL || ''}${import.meta.env.VITE_API_BASE_PATH || ''}`,
    
    // Authentication token, default to null if not provided
    token: import.meta.env.VITE_TOKEN || null,

    // Coordinate Reference System options, loaded from localStorage or defaulting to an empty object
    CRSOptions: JSON.parse(localStorage.getItem('KoordinatTranformationCRSOptions')) || {},

    CoverArea: '',
    
    // Selected CRS for transformation: From and To
    CRSFrom: '',
    CRSTo: '',
    
    // Coordinates for transformation: Input and Output
    CoordinatesFrom: {'v1': 0, 'v2': 0, 'v3': 0, 'v4': 0}, // Use a consistent structure for coordinate data, e.g., { v1: 0, v2: 0, v3: 0, v4: 0 }
    CoordinatesTo: {'v1': 0, 'v2': 0, 'v3': 0, 'v4': 0},
  }),
  getters: {
    getWebProj: (state) => state.webproj,
    getToken: (state) => state.token,

    getCoverArea: (state) => state.CoverArea,
    
    getCRS: (state) => ({
      CRSFrom: state.CRSFrom,
      CRSTo: state.CRSTo,
    }),
    
    getCRSTo: (state) => state.CRSTo,
    getCRSFrom: (state) => state.CRSFrom,
    getCRSOptions: (state) => state.CRSOptions,
    
    getCRSDisplayOptionsDK: (state) => {
      if (state.CRSOptions) {
        const Options = []
        Object.values(state.CRSOptions.DK || {}).forEach((crs) => {
          Options.push(`${crs.title_short} (${crs.srid})`)
        })
        Object.values(state.CRSOptions.Global || {}).forEach((crs) => {
          Options.push(`${crs.title_short} (${crs.srid})`)
        })
        return Options
      }
      return []
    },
    
    getCRSDisplayOptionsGL: (state) => {
      if (state.CRSOptions) {
        const Options = []
        Object.values(state.CRSOptions.GL || {}).forEach((crs) => {
          Options.push(`${crs.title_short} (${crs.srid})`)
        })
        Object.values(state.CRSOptions.Global || {}).forEach((crs) => {
          Options.push(`${crs.title_short} (${crs.srid})`)
        })
        return Options
      }
      return []
    },
    
    getCoordinatesFrom: (state) => state.CoordinatesFrom,
    getCoordinatesTo: (state) => state.CoordinatesTo,

    getCRSFromDisplayInfo: (state) => {
      if(state.CRSOptions[state.CoverArea][state.CRSFrom]){
        return state.CRSOptions[state.CoverArea][state.CRSFrom]
      }
      return  state.CRSOptions.Global[state.CRSFrom]
    },
    getCRSToDisplayInfo: (state) => {
      if(state.CRSOptions[state.CoverArea][state.CRSTo]) {
        return state.CRSOptions[state.CoverArea][state.CRSTo]
      }
      return state.CRSOptions.Global[state.CRSTo]
    },
  },
  actions: {
    setCoverArea(area) {
      this.CoverArea = area
    },
    async fetchCRSOptions() {
      try {
        const response = await fetch(`https://api.dataforsyningen.dk/rest/webproj/v1.2/crs/?token=${this.token}`)
        if (!response.ok) {
          throw new Error(`Error fetching CRS-Options! status: ${response.status}`)
        }
          
        const data = await response.json()
        const updatedCRSOptions = { ...this.CRSOptions }
        const coverAreas = ['DK', 'GL', 'Global']
        for (const coverArea of coverAreas) {
          if (!updatedCRSOptions[coverArea]) {
            updatedCRSOptions[coverArea] = {}
          }
          
          const crsOptions = data[coverArea] || []

          const fetchDetailsPromises = crsOptions.map(async (crsOption) => {
            if (!updatedCRSOptions[coverArea][crsOption]) {
              try {
                const detailsResponse = await fetch(`https://api.dataforsyningen.dk/rest/webproj/v1.2/crs/${crsOption}?token=${this.token}`)
                if (!detailsResponse.ok) {
                  throw new Error(`Error fetching details for ${crsOption}`)
                }
                const crsDetails = await detailsResponse.json()
                updatedCRSOptions[coverArea][crsOption] = crsDetails
              } catch (detailsError) {
                console.error(`Error fetching CRS details for: ${crsOption}`, detailsError)
              }
            }
          })
          
          await Promise.all(fetchDetailsPromises)
        }
        
        this.CRSOptions = updatedCRSOptions
        localStorage.setItem('KoordinatTranformationCRSOptions', JSON.stringify(updatedCRSOptions))
        console.log(this.CRSOptions)
      } catch (error) {
        console.error('Error fetching CRS Options: ', error)
      }
    },
    setCRSTo(payload) {
      this.CRSTo = payload
    },
    
    setCRSFrom(payload) {
      this.CRSFrom = payload
    },
    
    async setCoordinatesFrom({ crs, coordinates }) {
      if(crs === this.CRSFrom) {
        this.CoordinatesFrom = coordinates

      }
      else{
        try {
          const coordinateResponse = await fetch(
            `${this.webproj}${crs}/${this.CRSFrom}/${mapCoorToList(coordinates)}?token=${this.token}`,
          )
          if(!coordinateResponse.ok){
            throw new Error(`Error Fetching coordinatesFrom: ${coordinateResponse.statusText}`)
          }
          const coordinatesData = await coordinateResponse.json()
          this.CoordinatesFrom = coordinatesData
        } catch (error) {
          console.error('Failed to fetch and update coordinateFrom', error)
        }
      }
    },
    
    async setCoordinatesTo() {
      if(this.CRSFrom === this.CRSTo) {
        this.CoordinatesTo = this.CoordinatesFrom
      }
      else {
        try {
          const coordinateResponse = await fetch(
            `${this.webproj}${this.CRSFrom}/${this.CRSTo}/${mapCoorToList(this.CoordinatesFrom)}?token=${this.token}`,
          )
          if(!coordinateResponse.ok){
            throw new Error(`Error Fetching coordinatesTo: ${coordinateResponse.statusText}`)
          }
          const coordinatesData = await coordinateResponse.json()
          this.CoordinatesTo = coordinatesData
        } catch (error) {
          console.error('Failed to fetch and update coordinateTo', error)
        }
      }
    },
    
    clearState() {
      this.CRSFrom = ''
      this.CRSTo = ''
      this.CoordinatesFrom = {}
      this.CoordinatesTo = {}
    },
  },
})