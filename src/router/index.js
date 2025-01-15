import { createRouter, createWebHistory } from 'vue-router'

const Denmark = () => import('../views/DenmarkView.vue')
const Greenland = () => import('../views/GreenlandView.vue')
const About = () => import('../views/AboutView.vue')

const routes = [
    {
        path: '/Denmark',
        name: 'DenmarkView',
        alias: ['/', '/home'],
        components: {
            default: Denmark
        }
    },
    {
        path: '/Greenland',
        name: 'GreenlandView',
        components: {
            default: Greenland
        }
    },
    {
        path: '/About',
        name: 'AboutView',
        components: {
            default: About
        }
    },
    {
        path: '/was',
        beforeEnter () {
            location.href = 'https://www.was.digst.dk/koordinattransformation-dk'
        },
        name: 'Webtilgaengelighed',
        meta: {
          textColor: 'black',
          domain: 'koordinattransformation.dk'
        }
      }
]

const router = createRouter({
    history: createWebHistory(),
    routes
  })

export default router