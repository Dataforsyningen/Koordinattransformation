<template>

  <!--Representation of meter coordinates-->
  <div class="KT-input-column" v-if="!c1Coord.isDegree && !c2Coord.isDegree">
    <div class="KT-input-row">
      <span 
        class="KT-input-row"
      >
        <svg class='KT-icon'>
          <use :href='c1Coord.arrowdir' />
        </svg>
        <input 
          type='number'
          step='0.0001'
          v-model='c1Coord.cM'
          @input='debounceUpdate'
        />
        <p> m </p>
      </span>
      <span
        class="KT-input-row"
      >
        <svg class='KT-icon'>
          <use :href='c2Coord.arrowdir' />
        </svg>
        <input 
          type='number'
          step='0.0001'
          v-model='c2Coord.cM'
          @input='debounceUpdate'
        />
        <p> m </p>
      </span>
    </div>
    <span v-if="c3Coord.isActive" class='KT-input-row'>
      <svg class='KT-icon'>
        <use :href='c3Coord.upIcon' />
      </svg>
        <input 
          type='number'
          step='0.0001'
          v-model='c3Coord.cM'
          @input='debounceUpdate'
        />
      <p> m </p>
    </span>
  </div>

  <!--Representation of degree coordinates-->
  <div v-else class="KT-input-column">
    <span 
      class="KT-input-row"
    >
      <svg class='KT-icon'>
        <use :href='c1Coord.arrowdir' />
      </svg>
      <input 
        type='number'
        step='0.0001'
        v-model='c1Coord.cD1'
        @input='debounceUpdate'
      />
      <p> °N </p>
      <input 
        v-if="degreeFormat==='D.min' || degreeFormat === 'D.min.sec'"
        type='number'
        step='0.0001'
        v-model='c1Coord.cD2'
        @input='debounceUpdate'
      />
      <input 
        v-if="degreeFormat === 'D.min.sec'"
        type='number'
        step='0.0001'
        v-model='c1Coord.cD3'
        @input='debounceUpdate'
      />
      
    </span>

    <span
      class="KT-input-row"
    >
      <svg class='KT-icon'>
        <use :href='c2Coord.arrowdir' />
      </svg>
      <input 
        type='number'
        step='0.0001'
        v-model='c2Coord.cD1'
        @input='debounceUpdate'
      />
      <p> °E </p>
      <input 
        v-if="degreeFormat==='D.min' || degreeFormat === 'D.min.sec'"
        type='number'
        step='0.0001'
        v-model='c1Coord.cD2'
        @input='debounceUpdate'
      />
      <input 
        v-if="degreeFormat === 'D.min.sec'"
        type='number'
        step='0.0001'
        v-model='c2Coord.cD3'
        @input='debounceUpdate'
      />
    </span>

    <span v-if="c3Coord.isActive" class='KT-input-row'>
      <svg class='KT-icon'>
        <use :href='c3Coord.upIcon' />
      </svg>
        <input 
          type='number'
          step='0.0001'
          v-model='c3Coord.cM'
          @input='debounceUpdate'
        />
      <p> m </p>
    </span>
    <span class="KT-radio-row">
      <input type="radio" id="D" name="format" value="D" checked="checked" v-model="degreeFormat">
      <label for="D">D</label><br>
      <input type="radio" id="D.min" name="format" value="D.min" v-model="degreeFormat">
      <label for="D.min">D.min </label><br>
      <input type="radio" id="D.min.sec" name="format" value="D.min.sec" v-model="degreeFormat">
      <label for="D.min.sec">D.min.sec</label>
    </span>
    {{ degreeFormat }}
  </div>
</template>
  
<script setup>
import { computed, watch, ref, onMounted } from 'vue'
import { useKtStore } from '../../store/store.js'

const KtStore = useKtStore()
const debounceTimeout = ref(null)

const coorFrom = computed(() => KtStore.getCoordinatesFrom)

const CRSInfo = computed(() => KtStore.getCRSFromDisplayInfo)

const svgPath = '/src/assets/icons/icons.svg#'

const degreeFormat = ref('D')

// three ref to recieve coordinates and formatting logic
const c1Coord = ref({
  arrowdir: '/src/assets/icons/icons.svg#direction-east',
  isDegree: false,
  cM: 0,
  cD1: 0,
  cD2: 0,
  cD3: 0
})
const c2Coord = ref({
  arrowdir: '/src/assets/icons/icons.svg#direction-north',
  isDegree: false,
  cM: 0,
  cD1: 0,
  cD2: 0,
  cD3: 0
})

const c3Coord = ref({
  upIcon: '/src/assets/icons/icons.svg#arrow-up',
  isActive : true,
  cM: 0
})


// Convert coordinates to meter or degrees (1, 2 or 3) representation
const toRepresentation = (coordinates) => {
    if(!c1Coord.value.isDegree && !c2Coord.value.isDegree) {
      c1Coord.value.cM = coordinates.v1;
      c2Coord.value.cM = coordinates.v2;
      c3Coord.value.cM = coordinates.v3;
    }
    else{
      switch(degreeFormat.value) {
        case 'D': {
          c1Coord.value.cD1 = coordinates.v1;
          c2Coord.value.cD1 = coordinates.v2;
          c3Coord.value.cM = coordinates.v3;
          break
        }
        case 'D.min': {
          const d1 = Math.floor(coordinates.v1)
          const d2 = Math.floor(coordinates.v2)

          const m1 = parseFloat(((coordinates.v1 - d1) * 60)).toFixed(6)
          const m2 = parseFloat(((coordinates.v1 - d2) * 60)).toFixed(6)
          
          c1Coord.value.cD1 = d1
          c1Coord.value.cD2 = m1

          c2Coord.value.cD1 = d2
          c2Coord.value.cD2 = m2

          c3Coord.value.cM = coordinates.v3
          break
        }
        case 'D.min.sec': {
          const d1 = Math.floor(coordinates.v1)
          const d2 = Math.floor(coordinates.v2)

          const m1 = Math.floor((coordinates.v1 - d1) * 60)
          const m2 = Math.floor((coordinates.v2 - d2) * 60)

          const s1 = parseFloat(((coordinates.v1 - d1 - m1 / 60) * 3600)).toFixed(4)
          const s2 = parseFloat(((coordinates.v2 - d2 - m2 / 60) * 3600)).toFixed(4)

          c1Coord.value.cD1 = d1
          c1Coord.value.cD2 = m1
          c1Coord.value.cD3 = s1

          c2Coord.value.cD1 = d2
          c2Coord.value.cD2 = m2
          c2Coord.value.cD3 = s2

          c3Coord.value.cM = coordinates.v3
          
          break
        }
      }
    }
}

//reverse from previous representation to update koordinates in store
const reverseRepresentation = () => {
    if(!c1Coord.value.isDegree && !c2Coord.value.isDegree) {
        return {
          v1: c1Coord.value.cM,
          v2: c2Coord.value.cM,
          v3: c3Coord.value.cM,
          v4: 0.0
        }
    }
    else{
      switch(degreeFormat.value) {
        case 'D':
          return {
            v1: c1Coord.value.cD1,
            v2: c2Coord.value.cD1,
            v3: c3Coord.value.cD1,
            v4: 0.0
          }
        case 'D.min':
          break
        case 'D.min.sec':
          break

        default:

      }
      return {
        v1: c1Coord.value.cD1,
        v2: c2Coord.value.cD1,
        v3: c3Coord.value.cD1,
        v4: 0.0
      }
    }
}


//updates store using debouncing
const debounceUpdate = () => {
    console.log('update queued')
    if (debounceTimeout.value) {
        clearTimeout(debounceTimeout.value)
    }
    debounceTimeout.value = setTimeout(() => {
        console.log('update executed')
        const storeRepresentation = reverseRepresentation()
        console.log(storeRepresentation)
        console.log(coorFrom.value)
        KtStore.setCoordinatesFrom({
          crs: KtStore.CRSFrom,
          coordinates: storeRepresentation
        })
    }, 500)

    console.log(coorFrom.value)
}

//formats coordinate representation metadata before 
const formatInputCoor = () => {

  switch (CRSInfo.value.v1) {
    case 'Easting':
      c1Coord.value.arrowdir = svgPath + 'direction-east'
      c1Coord.value.isDegree = false
      break;
    case 'Westing':
      c1Coord.value.arrowdir = svgPath + 'direction-west'
      c1Coord.value.isDegree = false
      break;
    case 'Breddegrad':
      c1Coord.value.arrowdir = svgPath + 'direction-north'
      c1Coord.value.isDegree = true
      break
    default:
      c1Coord.value.arrowdir = svgPath + 'direction-east'
      c1Coord.value.isDegree = false
  }
  switch(CRSInfo.value.v2){ 
    case 'Northing':
      c2Coord.value.arrowdir = svgPath + 'direction-north'
      c2Coord.value.isDegree = false
      break
    case 'Længdegrad':
      c2Coord.value.arrowdir = svgPath + 'direction-east'
      c2Coord.value.isDegree = true
      break
    default:
      c2Coord.value.arrowdir = svgPath + 'direction-north'
      c2Coord.value.isDegree = false
  }
  switch(CRSInfo.value.v3) {
    case 'Kote' : 
      c3Coord.value.isActive = true
      break
    case 'Ellipsoidehøjde' :
      c3Coord.value.isActive = true
      break
    default:
      c3Coord.value.isActive = false
  }
}

// Watch for changes from the store and update the input fields
watch(coorFrom, (to) => {
    formatInputCoor()
    toRepresentation(to)
})

</script>


<style scoped>
.KT-input-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.KT-input-row {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 1rem;
  max-width: 100%;
  justify-content: flex-start;
}
.KT-radio-row {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 0.5rem;
  justify-content: flex-end;
}

</style>
  