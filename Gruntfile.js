module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-screeps');
    grunt.initConfig({
        screeps: {
            options: {
                email: process.env.SCREEPS_COM_EMAIL,
                token: process.env.SCREEPS_COM_TOKEN,
                branch: process.env.SCREEPS_COM_BRANCH || 'default',
                //server: 'season'
            },
            dist: {
                src: ['dist/*.js']
            }
        }
    });
}
