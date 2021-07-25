import HOME from '@/mypages/index.vue';
import HOMEABOUT from '@/mypages/about.vue';
import HOMEAUTHORS from '@/mypages/authors/index.vue';
import HOMEAUTHORS_USERID from '@/mypages/authors/_userid/index.vue';
import HOMEEDITORS from '@/mypages/editors/index.vue';
import HOMEEDITORS_USERID from '@/mypages/editors/_userid.vue';
import HOMEREADERS from '@/mypages/readers/index.vue';
import HOMEREADERS_USERID from '@/mypages/readers/_userid/index.vue';
import HOMEREADERS_USERIDAFOOTER from '@/components/AFooter.vue';
import HOMEREADERS_USERIDAHEADER from '@/components/AHeader.vue';

export default [
  {
    path: '/',
    component: HOME,
    name: 'home',
    myMethod: function myMethod(arg1, arg2) {console.log(arg1, arg2);},
    children: [
      {
        path: 'readers',
        component: HOMEREADERS,
        children: [
          {
            path: ':userid',
            meta: {
              needsAuth: true
            },
            components: {
              header: HOMEREADERS_USERIDAHEADER,
              footer: HOMEREADERS_USERIDAFOOTER,
              default: HOMEREADERS_USERID
            },
            props: {
              header: true,
              footer: true,
              default: true
            }
          }
        ]
      },
      {
        path: 'editors',
        component: HOMEEDITORS,
        children: [
          {
            path: ':userid',
            component: HOMEEDITORS_USERID,
            props: true
          }
        ]
      },
      {
        path: 'authors',
        component: HOMEAUTHORS,
        children: [
          {
            path: ':userid',
            component: HOMEAUTHORS_USERID,
            props: true
          }
        ]
      },
      {
        path: '/about',
        component: HOMEABOUT
      },
      {
        path: ':myDynamicName(.*)',
        redirect: '/'
      }
    ]
  }
]
