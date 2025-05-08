#version 300 es

precision highp float;

out vec4 FragColor;
in vec3 fragPos;  
in vec3 normal;  
in vec2 texCoord;

struct Material {
    sampler2D diffuse; // diffuse map
    vec3 specular;     // 표면의 specular color
    float shininess;   // specular 반짝임 정도
};

struct Light {
    //vec3 position;
    vec3 direction;
    vec3 ambient; // ambient 적용 strength
    vec3 diffuse; // diffuse 적용 strength
    vec3 specular; // specular 적용 strength
};

uniform Material material;
uniform Light light;
uniform vec3 u_viewPos;
uniform float toonLevels;  


void main() {
    // 1 ambient
    vec3 rgb = vec3(1.0, 0.5, 0.0);
    vec3 ambient = light.ambient * rgb;

    // 2 diffuse (Lambert)
    vec3 norm    = normalize(normal);
    vec3 lightDir = normalize(light.direction);
    float rawDiff = max(dot(norm, lightDir), 0.0);

    float diffIdx = floor(rawDiff * toonLevels);
    float diff    = (diffIdx + 0.5) / toonLevels;

    vec3 diffuse = light.diffuse * diff * rgb;

    // 3 specular (Blinn-Phong)
    vec3 viewDir   = normalize(u_viewPos - fragPos);
    vec3 reflectDir = reflect(-lightDir, norm);

    float rawSpec = 0.0;
    if (rawDiff > 0.0) {
        rawSpec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
        float specIdx = floor(rawSpec * toonLevels);
        rawSpec = (specIdx + 0.5) / toonLevels;
    }
    vec3 specular = light.specular * rawSpec * material.specular;

    // 4 합산
    vec3 color = ambient + diffuse + specular;
    FragColor = vec4(color, 1.0);
}